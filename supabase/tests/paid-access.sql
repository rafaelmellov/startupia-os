begin;
insert into auth.users(id,email) values
 ('71000000-0000-4000-8000-000000000001','startupia-paid-a@example.test'),
 ('71000000-0000-4000-8000-000000000002','startupia-unpaid-b@example.test');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"71000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
insert into public.organizations(id,owner_id,name) values('72000000-0000-4000-8000-000000000001',auth.uid(),'Paid gate A');
select public.save_onboarding('72000000-0000-4000-8000-000000000001','{"completed":true,"startup":"Saved before payment"}',0,null,0);
-- Completed pre-payment context remains readable but cannot create a premium workspace.
do $$ begin
 if public.has_paid_access('72000000-0000-4000-8000-000000000001') then raise exception 'Unpaid access granted';end if;
 if not exists(select 1 from public.onboardings where completed_at is not null) then raise exception 'Pre-payment onboarding completion lost';end if;
 begin
  perform public.save_workspace('72000000-0000-4000-8000-000000000001','{"private":"content"}',0);
  raise exception 'Unpaid RPC write accepted';
 exception when sqlstate 'PT402' then null;end;
 begin
  perform public.reserve_ai_execution('72000000-0000-4000-8000-000000000001','fixture-model');
  raise exception 'Unpaid AI reservation accepted';
 exception when sqlstate 'PT402' then null;end;
 begin
  perform public.save_onboarding('72000000-0000-4000-8000-000000000001','{"completed":true}',1,'{}',0);
  raise exception 'Onboarding bypass created workspace';
 exception when sqlstate 'PT402' then null;end;
end $$;
reset role;
-- Seed retained data and an active but not payment-verified subscription as trusted fixture setup.
insert into public.workspaces(organization_id,state) values('72000000-0000-4000-8000-000000000001','{"private":"retained"}');
insert into public.subscriptions(organization_id,plan,status,provider,provider_subscription_id,valid_until)
 values('72000000-0000-4000-8000-000000000001','build','active','stripe','sub_gateA',now()+interval '1 day');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"71000000-0000-4000-8000-000000000001","role":"authenticated","user_metadata":{"plan":"growth","paid":true}}',true);
do $$ begin
 if public.has_paid_access('72000000-0000-4000-8000-000000000001') then raise exception 'Unverified active subscription granted access';end if;
 if (select count(*) from public.workspaces)<>0 then raise exception 'Unpaid direct read leaked content';end if;
 update public.workspaces set state='{"private":"tampered"}';
 begin
  insert into public.workspaces(organization_id,state) values('72000000-0000-4000-8000-000000000001','{}');
  raise exception 'Unpaid Data API insert accepted';
 exception when insufficient_privilege then null;end;
 update public.subscriptions set payment_verified_until=now()+interval '1 year';
 if public.has_paid_access('72000000-0000-4000-8000-000000000001') then raise exception 'Client self-verified payment';end if;
end $$;
reset role;
update public.subscriptions set payment_verified_until=now()+interval '1 day' where organization_id='72000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"71000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$ begin
 if not public.has_paid_access('72000000-0000-4000-8000-000000000001') then raise exception 'Verified payer denied';end if;
 if not exists(select 1 from public.workspaces where state->>'private'='retained') then raise exception 'Blocked mutation changed retained work';end if;
end $$;
select public.save_workspace('72000000-0000-4000-8000-000000000001','{"private":"paid edit"}',1);
select public.reserve_ai_execution('72000000-0000-4000-8000-000000000001','fixture-model');
insert into public.files(id,organization_id,name,size,storage_path) values('73000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000001','fixture.txt',20,'72000000-0000-4000-8000-000000000001/fixture');
insert into storage.objects(bucket_id,name) values('startupia-files','72000000-0000-4000-8000-000000000001/fixture');
-- A different authenticated tenant cannot use the payer's entitlement.
select set_config('request.jwt.claims','{"sub":"71000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
insert into public.organizations(id,owner_id,name) values('72000000-0000-4000-8000-000000000002',auth.uid(),'Unpaid gate B');
do $$ begin
 if public.has_paid_access('72000000-0000-4000-8000-000000000001') then raise exception 'Foreign entitlement leaked';end if;
 if (select count(*) from public.workspaces)<>0 then raise exception 'Foreign workspace leaked';end if;
 if (select count(*) from storage.objects where bucket_id='startupia-files')<>0 then raise exception 'Foreign original leaked';end if;
end $$;
reset role;
update public.subscriptions set status='trialing' where organization_id='72000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"71000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$ begin
 if public.has_paid_access('72000000-0000-4000-8000-000000000001') then raise exception 'Trial bypassed payment';end if;
 if (select count(*) from public.workspaces)<>0 then raise exception 'Trial retained access';end if;
 if (select count(*) from public.files)<>1 then raise exception 'File metadata was destroyed';end if;
 if (select count(*) from storage.objects where bucket_id='startupia-files')<>0 then raise exception 'Unpaid original remained readable';end if;
end $$;
reset role;
update public.subscriptions set status='active',payment_verified_until=now()-interval '1 second' where organization_id='72000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"71000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$ begin
 if public.has_paid_access('72000000-0000-4000-8000-000000000001') then raise exception 'Expired payment retained access';end if;
end $$;
reset role;
do $$ begin
 if not exists(select 1 from public.workspaces where organization_id='72000000-0000-4000-8000-000000000001' and state->>'private'='paid edit') then raise exception 'Expiry deleted or rewrote workspace';end if;
end $$;
select 'PASS: paid period, no unpaid/trial/self-upgrade access, Data API and storage isolation, onboarding continuity and retained data' as result;
rollback;
