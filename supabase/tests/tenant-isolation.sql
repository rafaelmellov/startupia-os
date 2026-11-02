begin;
insert into auth.users(id,email) values
 ('10000000-0000-4000-8000-000000000001','startupia-rls-a@example.test'),
 ('10000000-0000-4000-8000-000000000002','startupia-rls-b@example.test');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","app_metadata":{}}',true);
insert into public.organizations(id,owner_id,name) values('20000000-0000-4000-8000-000000000001',auth.uid(),'RLS fixture A');
reset role;
insert into public.subscriptions(organization_id,plan,status,provider,provider_subscription_id,valid_until,payment_verified_until) values('20000000-0000-4000-8000-000000000001','build','active','stripe','sub_isolationA',now()+interval '1 day',now()+interval '1 day');
set local role authenticated;
select public.save_workspace('20000000-0000-4000-8000-000000000001','{"profile":{"name":"Private A"},"records":{}}',0);
do $$ begin
 if (select count(*) from public.workspaces)<>1 then raise exception 'Owner cannot read workspace';end if;
 begin
 perform public.save_workspace('20000000-0000-4000-8000-000000000001','{}',0);
 raise exception 'Stale write accepted';
 exception when sqlstate 'PT409' then null;end;
end $$;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated","user_metadata":{"startupia_admin":true},"app_metadata":{}}',true);
insert into public.organizations(id,owner_id,name) values('20000000-0000-4000-8000-000000000002',auth.uid(),'RLS fixture B');
do $$ begin
 if (select count(*) from public.workspaces)<>0 then raise exception 'Cross-tenant workspace leak';end if;
 if (select count(*) from public.organizations)<>1 then raise exception 'Cross-tenant organization leak';end if;
 begin
 perform public.save_workspace('20000000-0000-4000-8000-000000000001','{}',1);
 raise exception 'Cross-tenant write accepted';
 exception when insufficient_privilege then null;end;
 begin
 insert into public.subscriptions(organization_id,plan,status,provider,valid_until) values('20000000-0000-4000-8000-000000000002','growth','active','fake',now()+interval '1 year');
 raise exception 'Self-upgrade accepted';
 exception when insufficient_privilege then null;end;
 begin
 insert into public.mentors(name,role,bio,specialty) values('Fake admin','Test','This must never become a real mentor profile.','Producto y MVP');
 raise exception 'User metadata granted admin';
 exception when insufficient_privilege then null;end;
end $$;
select 'PASS: owner read, stale version rejection, tenant isolation, cross-tenant write denial, subscription self-upgrade denial, user-metadata admin denial' as result;
rollback;
