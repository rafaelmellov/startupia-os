-- Paid access is a database rule as well as a server/UI rule. Existing data is retained.
-- Billing reconciliation must populate this only from a verified paid invoice period.
alter table public.subscriptions add column payment_verified_until timestamptz;

create function public.has_paid_access(org uuid) returns boolean
language sql stable security invoker set search_path='' as $$
 select exists(
  select 1 from public.subscriptions s
  where s.organization_id=org and s.plan in ('build','growth') and s.status='active'
   and s.provider='stripe' and s.provider_subscription_id ~ '^sub_[A-Za-z0-9]+$'
   and s.valid_until>now() and s.payment_verified_until>now()
   and exists(select 1 from public.organization_members m where m.organization_id=org and m.user_id=auth.uid())
 )
$$;
revoke all on function public.has_paid_access(uuid) from public,anon;
grant execute on function public.has_paid_access(uuid) to authenticated;

-- Workspace content and AI history require a current paid period. Account, onboarding,
-- commercial interests and subscription status remain accessible before payment.
drop policy tenant_read on public.workspaces;
create policy tenant_read on public.workspaces for select to authenticated
 using(public.has_paid_access(organization_id));
drop policy editor_insert on public.workspaces;
create policy editor_insert on public.workspaces for insert to authenticated
 with check(public.is_org_editor(organization_id) and public.has_paid_access(organization_id));
drop policy editor_update on public.workspaces;
create policy editor_update on public.workspaces for update to authenticated
 using(public.is_org_editor(organization_id) and public.has_paid_access(organization_id))
 with check(public.is_org_editor(organization_id) and public.has_paid_access(organization_id));
drop policy tenant_read on public.ai_executions;
create policy tenant_read on public.ai_executions for select to authenticated
 using(public.has_paid_access(organization_id));

-- Owners may list metadata after cancellation. Original byte operations require
-- paid access. No content or original is deleted as a consequence of expiry.
drop policy editor_insert on public.files;
create policy editor_insert on public.files for insert to authenticated
 with check(public.is_org_editor(organization_id) and public.has_paid_access(organization_id));
drop policy editor_update on public.files;
create policy editor_update on public.files for update to authenticated
 using(public.is_org_editor(organization_id) and public.has_paid_access(organization_id))
 with check(public.is_org_editor(organization_id) and public.has_paid_access(organization_id));
drop policy startupia_file_read on storage.objects;
create policy startupia_file_read on storage.objects for select to authenticated using(
 bucket_id='startupia-files' and exists(
  select 1 from public.organization_members m
  where m.user_id=(select auth.uid()) and m.organization_id::text=(storage.foldername(name))[1]
   and public.has_paid_access(m.organization_id)
 )
);
drop policy startupia_file_create on storage.objects;
create policy startupia_file_create on storage.objects for insert to authenticated with check(
 bucket_id='startupia-files' and exists(
  select 1 from public.organization_members m
  where m.user_id=(select auth.uid()) and m.role in ('owner','editor')
   and m.organization_id::text=(storage.foldername(name))[1] and public.has_paid_access(m.organization_id)
 )
);

create or replace function public.save_workspace(org uuid,p_state jsonb,expected_version integer) returns integer
language plpgsql security invoker set search_path='' as $$
declare result integer;
begin
 if not public.is_org_editor(org) then raise exception 'Forbidden' using errcode='42501';end if;
 if not public.has_paid_access(org) then raise exception 'Paid access required' using errcode='PT402';end if;
 if expected_version=0 then
  insert into public.workspaces(organization_id,state) values(org,p_state) on conflict do nothing returning version into result;
 else
  update public.workspaces set state=p_state,version=version+1,updated_at=now()
  where organization_id=org and version=expected_version returning version into result;
 end if;
 if result is null then raise exception 'Version conflict' using errcode='PT409';end if;
 return result;
end $$;

-- Completion describes the onboarding metadata, not whether a workspace already exists.
-- The workspace is bootstrapped once, after payment, from this saved context.
create or replace function public.save_onboarding(org uuid,p_state jsonb,expected_version integer,p_workspace jsonb default null,workspace_version integer default 0) returns integer
language plpgsql security invoker set search_path='' as $$
declare result integer; finished boolean:=coalesce(p_state->'completed'='true'::jsonb,false);
begin
 if not public.is_org_editor(org) then raise exception 'Forbidden' using errcode='42501';end if;
 if p_workspace is not null and not public.has_paid_access(org) then raise exception 'Paid access required' using errcode='PT402';end if;
 if expected_version=0 then
  insert into public.onboardings(organization_id,state,completed_at)
  values(org,p_state,case when finished then now() end) on conflict do nothing returning version into result;
 else
  update public.onboardings set state=p_state,version=version+1,
   completed_at=case when finished then coalesce(completed_at,now()) end,updated_at=now()
  where organization_id=org and version=expected_version returning version into result;
 end if;
 if result is null then raise exception 'Version conflict' using errcode='PT409';end if;
 if p_workspace is not null then perform public.save_workspace(org,p_workspace,workspace_version);end if;
 return result;
end $$;

create or replace function private.reserve_ai(org uuid,p_model text) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid; cap integer:=10;
begin
 if auth.uid() is null or not exists(select 1 from public.organization_members where organization_id=org and user_id=auth.uid() and role in ('owner','editor')) then raise exception 'Forbidden' using errcode='42501';end if;
 if not public.has_paid_access(org) then raise exception 'Paid access required' using errcode='PT402';end if;
 if length(p_model)>100 or length(p_model)<1 then raise exception 'Invalid model';end if;
 perform pg_advisory_xact_lock(hashtextextended(org::text||':ai',0));
 if exists(select 1 from public.subscriptions where organization_id=org and plan='growth' and status='active' and valid_until>now() and payment_verified_until>now()) then cap=60;end if;
 if (select count(*) from public.ai_executions where organization_id=org and created_at>=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC')>=cap then raise exception 'Usage limit';end if;
 insert into public.ai_executions(organization_id,requested_by,model) values(org,auth.uid(),p_model) returning id into result;
 return result;
end $$;

-- Keep byte deletion and metadata deletion under the same paid mutation boundary.
drop policy files_delete on public.files;
create policy files_delete on public.files for delete to authenticated
 using(public.is_org_editor(organization_id) and public.has_paid_access(organization_id));
drop policy startupia_file_delete on storage.objects;
create policy startupia_file_delete on storage.objects for delete to authenticated using(
 bucket_id='startupia-files' and exists(
  select 1 from public.organization_members m
  where m.user_id=(select auth.uid()) and m.role in ('owner','editor')
   and m.organization_id::text=(storage.foldername(name))[1] and public.has_paid_access(m.organization_id)
 )
);
