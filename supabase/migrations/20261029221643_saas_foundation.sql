-- Startupia foundation. No service-role credentials are used by the browser or normal API.
create table public.organizations (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null unique references auth.users(id) on delete cascade,
 name text not null default 'Mi startup' check(length(name) between 1 and 100), created_at timestamptz not null default now()
);
create table public.organization_members (
 organization_id uuid not null references public.organizations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check(role in ('owner','editor','viewer')), primary key(organization_id,user_id)
);
create index organization_members_user_idx on public.organization_members(user_id);
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
create policy own_membership on public.organization_members for select to authenticated using(user_id=(select auth.uid()));
create policy organization_read on public.organizations for select to authenticated using(owner_id=(select auth.uid()) or id in(select organization_id from public.organization_members where user_id=(select auth.uid())));
create policy organization_create on public.organizations for insert to authenticated with check(owner_id=(select auth.uid()));
grant select,insert on public.organizations to authenticated;
grant select on public.organization_members to authenticated;

create schema if not exists private;
create function private.add_owner_membership() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or new.owner_id<>auth.uid() then raise exception 'Unauthorized owner'; end if;
 insert into public.organization_members values(new.id,new.owner_id,'owner');return new;
end $$;
revoke all on function private.add_owner_membership() from public;
create trigger organization_owner after insert on public.organizations for each row execute function private.add_owner_membership();

create function public.is_org_editor(org uuid) returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.organization_members where organization_id=org and user_id=auth.uid() and role in ('owner','editor'))
$$;
revoke all on function public.is_org_editor(uuid) from public;
grant execute on function public.is_org_editor(uuid) to authenticated;

create table public.workspaces (
 organization_id uuid primary key references public.organizations(id) on delete cascade,
 state jsonb not null check(jsonb_typeof(state)='object' and octet_length(state::text)<=950000),
 version integer not null default 1 check(version>0), updated_at timestamptz not null default now()
);
create table public.onboardings (
 organization_id uuid primary key references public.organizations(id) on delete cascade,
 state jsonb not null check(jsonb_typeof(state)='object' and octet_length(state::text)<24000),
 version integer not null default 1, completed_at timestamptz, updated_at timestamptz not null default now()
);
create table public.plan_interests (
 organization_id uuid primary key references public.organizations(id) on delete cascade,
 plan text not null check(plan in ('build','growth')),updated_at timestamptz not null default now()
);
create table public.subscriptions (
 organization_id uuid primary key references public.organizations(id) on delete cascade,
 plan text not null check(plan in ('build','growth')),status text not null check(status in ('active','trialing','past_due','canceled','incomplete')),
 provider text not null, provider_subscription_id text unique, valid_until timestamptz not null,updated_at timestamptz not null default now()
);
create table public.mentors (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 2 and 100),
 role text not null check(length(role)<=160),bio text not null check(length(bio) between 20 and 2000),
 specialty text not null check(specialty in ('Estrategia y validación','Producto y MVP','Ventas y crecimiento')), active boolean not null default true
);
create table public.mentor_requests (
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id) on delete cascade,
 request_id text not null check(length(request_id) between 20 and 80),mentor_id uuid references public.mentors(id),
 data jsonb not null check(octet_length(data::text)<6000),status text not null default 'pending' check(status in ('pending','contacted','confirmed','completed','canceled')),
 created_at timestamptz not null default now(), unique(organization_id,request_id)
);
create table public.files (
 id uuid not null,organization_id uuid not null references public.organizations(id) on delete cascade,
 name text not null check(length(name) between 1 and 200), size integer not null check(size between 1 and 3145728),
 storage_path text not null unique,created_at timestamptz not null default now(),primary key(organization_id,id)
);
create table public.ai_executions (
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id) on delete cascade,
 requested_by uuid not null references auth.users(id),status text not null default 'reserved' check(status in ('reserved','completed','failed')),
 model text not null,input_tokens integer not null default 0,output_tokens integer not null default 0,created_at timestamptz not null default now()
);
create index mentor_requests_org_created_idx on public.mentor_requests(organization_id,created_at);
create index ai_executions_org_created_idx on public.ai_executions(organization_id,created_at);

do $$ declare t text; begin
 foreach t in array array['workspaces','onboardings','plan_interests','subscriptions','mentor_requests','files','ai_executions'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy tenant_read on public.%I for select to authenticated using(organization_id in(select organization_id from public.organization_members where user_id=(select auth.uid())))',t);
 execute format('grant select on public.%I to authenticated',t);
 end loop;
 foreach t in array array['workspaces','onboardings','plan_interests','files'] loop
 execute format('create policy editor_insert on public.%I for insert to authenticated with check(public.is_org_editor(organization_id))',t);
 execute format('create policy editor_update on public.%I for update to authenticated using(public.is_org_editor(organization_id)) with check(public.is_org_editor(organization_id))',t);
 execute format('grant insert,update on public.%I to authenticated',t);
 end loop;
end $$;
create policy files_delete on public.files for delete to authenticated using(public.is_org_editor(organization_id));
grant delete on public.files to authenticated;
alter table public.mentors enable row level security;
create policy mentor_catalog on public.mentors for select to anon,authenticated using(active);
create policy mentor_admin on public.mentors for all to authenticated using((auth.jwt()->'app_metadata'->>'startupia_admin')='true') with check((auth.jwt()->'app_metadata'->>'startupia_admin')='true');
grant select on public.mentors to anon,authenticated;
grant insert,update on public.mentors to authenticated;
create policy request_create on public.mentor_requests for insert to authenticated with check(public.is_org_editor(organization_id) and status='pending');
create policy request_admin_read on public.mentor_requests for select to authenticated using((auth.jwt()->'app_metadata'->>'startupia_admin')='true');
create policy request_admin_update on public.mentor_requests for update to authenticated using((auth.jwt()->'app_metadata'->>'startupia_admin')='true') with check((auth.jwt()->'app_metadata'->>'startupia_admin')='true');
grant insert,update on public.mentor_requests to authenticated;

create function public.save_workspace(org uuid,p_state jsonb,expected_version integer) returns integer language plpgsql security invoker set search_path='' as $$
declare result integer;
begin
 if not public.is_org_editor(org) then raise exception 'Forbidden' using errcode='42501';end if;
 if expected_version=0 then
 insert into public.workspaces(organization_id,state) values(org,p_state) on conflict do nothing returning version into result;
 else
 update public.workspaces set state=p_state,version=version+1,updated_at=now() where organization_id=org and version=expected_version returning version into result;
 end if;
 if result is null then raise exception 'Version conflict' using errcode='40001';end if;
 return result;
end $$;
revoke all on function public.save_workspace(uuid,jsonb,integer) from public;
grant execute on function public.save_workspace(uuid,jsonb,integer) to authenticated;

create function public.save_onboarding(org uuid,p_state jsonb,expected_version integer,p_workspace jsonb default null,workspace_version integer default 0) returns integer language plpgsql security invoker set search_path='' as $$
declare result integer;
begin
 if not public.is_org_editor(org) then raise exception 'Forbidden' using errcode='42501';end if;
 if expected_version=0 then
 insert into public.onboardings(organization_id,state,completed_at) values(org,p_state,case when p_workspace is null then null else now() end) on conflict do nothing returning version into result;
 else
 update public.onboardings set state=p_state,version=version+1,completed_at=case when p_workspace is null then null else now() end,updated_at=now() where organization_id=org and version=expected_version returning version into result;
 end if;
 if result is null then raise exception 'Version conflict' using errcode='40001';end if;
 if p_workspace is not null then perform public.save_workspace(org,p_workspace,workspace_version);end if;
 return result;
end $$;
revoke all on function public.save_onboarding(uuid,jsonb,integer,jsonb,integer) from public;
grant execute on function public.save_onboarding(uuid,jsonb,integer,jsonb,integer) to authenticated;

create function public.request_mentor(org uuid,p_request_id text,p_data jsonb,p_mentor uuid default null) returns uuid language plpgsql security invoker set search_path='' as $$
declare result uuid;
begin
 if not public.is_org_editor(org) then raise exception 'Forbidden' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended(org::text||':mentors',0));
 select id into result from public.mentor_requests where organization_id=org and request_id=p_request_id;
 if result is not null then return result;end if;
 if (select count(*) from public.mentor_requests where organization_id=org and created_at>now()-interval '1 day')>=5 then raise exception 'Request limit';end if;
 insert into public.mentor_requests(organization_id,request_id,data,mentor_id) values(org,p_request_id,p_data,p_mentor) returning id into result;
 return result;
end $$;
revoke all on function public.request_mentor(uuid,text,jsonb,uuid) from public;
grant execute on function public.request_mentor(uuid,text,jsonb,uuid) to authenticated;

-- Database-side quotas apply even when a client bypasses application routes.
create function private.guard_request() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.organization_members where organization_id=new.organization_id and user_id=auth.uid() and role in ('owner','editor')) then raise exception 'Forbidden';end if;
 perform pg_advisory_xact_lock(hashtextextended(new.organization_id::text||':mentors',0));
 if (select count(*) from public.mentor_requests where organization_id=new.organization_id and created_at>now()-interval '1 day')>=5 then raise exception 'Request limit';end if;
 if jsonb_typeof(new.data->'hours')<>'number' or (new.data->>'hours')::numeric not between 1 and 8 or (new.data->>'hours')::numeric<>trunc((new.data->>'hours')::numeric) then raise exception 'Invalid hours';end if;
 new.data=jsonb_set(new.data,'{total}',to_jsonb((new.data->>'hours')::integer*197));new.created_at=now();new.status='pending';return new;
end $$;
revoke all on function private.guard_request() from public;
create trigger request_guard before insert on public.mentor_requests for each row execute function private.guard_request();
create function private.guard_file() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.organization_members where organization_id=new.organization_id and user_id=auth.uid() and role in ('owner','editor')) then raise exception 'Forbidden';end if;
 perform pg_advisory_xact_lock(hashtextextended(new.organization_id::text||':files',0));
 if (select count(*) from public.files where organization_id=new.organization_id)>=100 then raise exception 'File limit';end if;
 if split_part(new.storage_path,'/',1)<>new.organization_id::text then raise exception 'Invalid file path';end if;
 return new;
end $$;
revoke all on function private.guard_file() from public;
create trigger file_guard before insert on public.files for each row execute function private.guard_file();

-- Execution reservation is restricted to callers in the organization and serialized per tenant.
create function private.reserve_ai(org uuid,p_model text) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; cap integer:=10;
begin
 if auth.uid() is null or not exists(select 1 from public.organization_members where organization_id=org and user_id=auth.uid() and role in ('owner','editor')) then raise exception 'Forbidden';end if;
 if length(p_model)>100 then raise exception 'Invalid model';end if;
 perform pg_advisory_xact_lock(hashtextextended(org::text||':ai',0));
 if exists(select 1 from public.subscriptions where organization_id=org and plan='growth' and status in ('active','trialing') and valid_until>now()) then cap=60;end if;
 if (select count(*) from public.ai_executions where organization_id=org and created_at>=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC')>=cap then raise exception 'Usage limit';end if;
 insert into public.ai_executions(organization_id,requested_by,model) values(org,auth.uid(),p_model) returning id into result;return result;
end $$;
revoke all on function private.reserve_ai(uuid,text) from public;
grant usage on schema private to authenticated;
grant execute on function private.reserve_ai(uuid,text) to authenticated;
create function public.reserve_ai_execution(org uuid,p_model text) returns uuid language sql security invoker set search_path='' as $$ select private.reserve_ai(org,p_model) $$;
revoke all on function public.reserve_ai_execution(uuid,text) from public;
grant execute on function public.reserve_ai_execution(uuid,text) to authenticated;
-- Telemetry only, never the source of invoices or billing entitlements.
create function private.finish_ai(execution uuid,p_status text,p_input integer,p_output integer) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or p_status not in ('completed','failed') or p_input<0 or p_output<0 then raise exception 'Invalid completion';end if;
 update public.ai_executions set status=p_status,input_tokens=p_input,output_tokens=p_output where id=execution and requested_by=auth.uid() and status='reserved';
end $$;
revoke all on function private.finish_ai(uuid,text,integer,integer) from public;
grant execute on function private.finish_ai(uuid,text,integer,integer) to authenticated;
create function public.finish_ai_execution(execution uuid,p_status text,p_input integer,p_output integer) returns void language sql security invoker set search_path='' as $$ select private.finish_ai(execution,p_status,p_input,p_output) $$;
revoke all on function public.finish_ai_execution(uuid,text,integer,integer) from public;
grant execute on function public.finish_ai_execution(uuid,text,integer,integer) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('startupia-files','startupia-files',false,3145728,array['application/octet-stream','text/plain','text/markdown','text/csv','text/tab-separated-values','application/pdf','application/json','application/vnd.openxmlformats-officedocument.wordprocessingml.document']) on conflict(id) do nothing;
create policy startupia_file_read on storage.objects for select to authenticated using(bucket_id='startupia-files' and (storage.foldername(name))[1] in(select organization_id::text from public.organization_members where user_id=(select auth.uid())));
create policy startupia_file_create on storage.objects for insert to authenticated with check(bucket_id='startupia-files' and (storage.foldername(name))[1] in(select organization_id::text from public.organization_members where user_id=(select auth.uid()) and role in ('owner','editor')));
create policy startupia_file_delete on storage.objects for delete to authenticated using(bucket_id='startupia-files' and (storage.foldername(name))[1] in(select organization_id::text from public.organization_members where user_id=(select auth.uid()) and role in ('owner','editor')));
