-- Retain the atomic billing ledger and persist only server-verified invoice periods.
create or replace function public.billing_operation(operation text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 org uuid; token uuid; row private.billing_customers; snapshot jsonb;
begin
 -- Explicit guard as well as grants; functions can otherwise be inadvertently exposed later.
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden' using errcode='42501';end if;
 if operation='lookup' then
  select * into row from private.billing_customers where customer_id=payload->>'customer';
  return jsonb_build_object('org',row.organization_id);
 end if;
 org:=(payload->>'org')::uuid;token:=(payload->>'token')::uuid;
 if operation='claim' then
  insert into private.billing_customers(organization_id) values(org) on conflict do nothing;
  select * into row from private.billing_customers where organization_id=org for update;
  if coalesce(payload->>'event','')<>'' and exists(select 1 from private.billing_events where event_id=payload->>'event') then return '{"duplicate":true}'::jsonb;end if;
  if row.lease_until>now() then return '{"acquired":false}'::jsonb;end if;
  update private.billing_customers set lease_token=token,lease_until=now()+interval '120 seconds' where organization_id=org;
  return jsonb_build_object('acquired',true,'customer',row.customer_id,'session',row.checkout_session,'plan',row.checkout_plan,'blocked',row.risk_blocked);
 end if;
 if operation='release' then
  update private.billing_customers set lease_token=null,lease_until=null where organization_id=org and lease_token=token;
  return '{}'::jsonb;
 end if;
 select * into row from private.billing_customers where organization_id=org for update;
 if row.organization_id is null or row.lease_token is distinct from token or row.lease_until<=now() then raise exception 'Expired lease';end if;
 if operation='bind' then
  if row.customer_id is not null and row.customer_id<>payload->>'customer' then raise exception 'Customer mismatch';end if;
  if payload->>'customer' not like 'cus_%' then raise exception 'Invalid customer';end if;
  update private.billing_customers set customer_id=payload->>'customer' where organization_id=org;
 elsif operation='session' then
  update private.billing_customers set checkout_session=payload->>'session',checkout_plan=payload->>'plan' where organization_id=org;
 elsif operation='finish' then
  if row.customer_id is distinct from payload->>'customer' then raise exception 'Customer mismatch';end if;
  if payload->>'event' not like 'evt_%' then raise exception 'Invalid event';end if;
  -- Both ledger and entitlement commit together. Exceptions leave the event retryable.
  insert into private.billing_events(event_id,organization_id,event_type) values(payload->>'event',org,payload->>'event_type');
  update private.billing_customers set risk_blocked=risk_blocked or coalesce((payload->>'blocked')::boolean,false) where organization_id=org;
  snapshot:=payload->'state';
  if snapshot is null or snapshot='null'::jsonb then
   update public.subscriptions set status='canceled',valid_until=now(),payment_verified_until=null,updated_at=now() where organization_id=org and provider='stripe';
  else
   insert into public.subscriptions(organization_id,plan,status,provider,provider_subscription_id,valid_until,payment_verified_until)
   values(org,snapshot->>'plan',case when row.risk_blocked or coalesce((payload->>'blocked')::boolean,false) then 'canceled' else snapshot->>'status' end,'stripe',snapshot->>'provider_subscription_id',(snapshot->>'valid_until')::timestamptz,case when snapshot->>'payment_verified_until' is null then null else least((snapshot->>'payment_verified_until')::timestamptz,(snapshot->>'valid_until')::timestamptz) end)
   on conflict(organization_id) do update set plan=excluded.plan,status=excluded.status,provider=excluded.provider,provider_subscription_id=excluded.provider_subscription_id,valid_until=excluded.valid_until,payment_verified_until=excluded.payment_verified_until,updated_at=now();
  end if;
 else raise exception 'Unknown billing operation';end if;
 return '{}'::jsonb;
end $$;
revoke all on function public.billing_operation(text,jsonb) from public,anon,authenticated;
grant execute on function public.billing_operation(text,jsonb) to service_role;
