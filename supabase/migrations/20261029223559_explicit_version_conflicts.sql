create or replace function public.save_workspace(org uuid,p_state jsonb,expected_version integer) returns integer language plpgsql security invoker set search_path='' as $$
declare result integer;
begin
 if not public.is_org_editor(org) then raise exception 'Forbidden' using errcode='42501';end if;
 if expected_version=0 then
 insert into public.workspaces(organization_id,state) values(org,p_state) on conflict do nothing returning version into result;
 else
 update public.workspaces set state=p_state,version=version+1,updated_at=now() where organization_id=org and version=expected_version returning version into result;
 end if;
 if result is null then raise exception 'Version conflict' using errcode='PT409';end if;
 return result;
end $$;
revoke all on function public.save_workspace(uuid,jsonb,integer) from public;
grant execute on function public.save_workspace(uuid,jsonb,integer) to authenticated;

create or replace function public.save_onboarding(org uuid,p_state jsonb,expected_version integer,p_workspace jsonb default null,workspace_version integer default 0) returns integer language plpgsql security invoker set search_path='' as $$
declare result integer;
begin
 if not public.is_org_editor(org) then raise exception 'Forbidden' using errcode='42501';end if;
 if expected_version=0 then
 insert into public.onboardings(organization_id,state,completed_at) values(org,p_state,case when p_workspace is null then null else now() end) on conflict do nothing returning version into result;
 else
 update public.onboardings set state=p_state,version=version+1,completed_at=case when p_workspace is null then null else now() end,updated_at=now() where organization_id=org and version=expected_version returning version into result;
 end if;
 if result is null then raise exception 'Version conflict' using errcode='PT409';end if;
 if p_workspace is not null then perform public.save_workspace(org,p_workspace,workspace_version);end if;
 return result;
end $$;
revoke all on function public.save_onboarding(uuid,jsonb,integer,jsonb,integer) from public;
grant execute on function public.save_onboarding(uuid,jsonb,integer,jsonb,integer) to authenticated;

