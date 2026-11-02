begin;
insert into auth.users(id,email) values('40000000-0000-4000-8000-000000000001','billing-qa@example.test');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"40000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
insert into public.organizations(id,owner_id,name) values('50000000-0000-4000-8000-000000000001',auth.uid(),'Billing fixture');
do $$ begin
 begin
 perform public.billing_operation('claim','{"org":"50000000-0000-4000-8000-000000000001","token":"60000000-0000-4000-8000-000000000001"}');
 raise exception 'Client accessed billing writer';
 exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role service_role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
select public.billing_operation('claim','{"org":"50000000-0000-4000-8000-000000000001","event":"evt_qa","token":"60000000-0000-4000-8000-000000000001"}');
select public.billing_operation('bind','{"org":"50000000-0000-4000-8000-000000000001","customer":"cus_qa","token":"60000000-0000-4000-8000-000000000001"}');
select public.billing_operation('finish',jsonb_build_object('org','50000000-0000-4000-8000-000000000001','token','60000000-0000-4000-8000-000000000001','customer','cus_qa','event','evt_unverified','event_type','customer.subscription.updated','blocked',false,'state',jsonb_build_object('plan','growth','status','active','provider_subscription_id','sub_qa','valid_until',now()+interval '1 day','payment_verified_until',null)));
do $$ begin
 if exists(select 1 from public.subscriptions where organization_id='50000000-0000-4000-8000-000000000001' and payment_verified_until is not null) then raise exception 'Missing invoice proof became a paid period';end if;
end $$;
select public.billing_operation('finish',jsonb_build_object('org','50000000-0000-4000-8000-000000000001','token','60000000-0000-4000-8000-000000000001','customer','cus_qa','event','evt_qa','event_type','invoice.paid','blocked',false,'state',jsonb_build_object('plan','growth','status','active','provider_subscription_id','sub_qa','valid_until',now()+interval '1 day','payment_verified_until',now()+interval '1 day')));
do $$ declare result jsonb;begin
 result:=public.billing_operation('claim','{"org":"50000000-0000-4000-8000-000000000001","event":"evt_qa","token":"60000000-0000-4000-8000-000000000002"}');
 if result->>'duplicate'<>'true' then raise exception 'Event replay not idempotent';end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"40000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$ begin
 if not exists(select 1 from public.subscriptions where organization_id='50000000-0000-4000-8000-000000000001' and plan='growth' and status='active' and payment_verified_until>now()) then raise exception 'Entitlement not committed';end if;
 update public.subscriptions set plan='build';
 if not exists(select 1 from public.subscriptions where organization_id='50000000-0000-4000-8000-000000000001' and plan='growth') then raise exception 'Client changed billing entitlement';end if;
end $$;
rollback;
