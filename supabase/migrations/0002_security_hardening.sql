-- Doit hardening follow-up: remove broad default table/function grants.
revoke all on schema public from anon, authenticated, public;
grant usage on schema public to authenticated;
revoke all privileges on all tables in schema public from anon, authenticated, public;
revoke all privileges on all sequences in schema public from anon, authenticated, public;
revoke all privileges on all functions in schema public from anon, authenticated, public;

grant select,insert,update,delete on public.profiles,public.groups,public.group_members,public.feed_sources,public.posts,public.events,public.group_messages,public.notifications,public.user_preferences,public.usage_sessions to authenticated;
grant select,insert,delete on public.event_tasks to authenticated;
grant update(is_done,title,assigned_to) on public.event_tasks to authenticated;
grant select,insert,delete on public.friendships to authenticated;
grant update(status) on public.friendships to authenticated;
grant select,insert,delete on public.event_invites to authenticated;
grant update(status,responded_at) on public.event_invites to authenticated;

grant execute on function private.is_group_member(uuid) to authenticated;
grant execute on function private.is_event_invitee(uuid) to authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create index if not exists event_invites_invited_by_idx on public.event_invites(invited_by);
create index if not exists event_tasks_assigned_to_idx on public.event_tasks(assigned_to);
create index if not exists event_tasks_created_by_idx on public.event_tasks(created_by);
create index if not exists feed_sources_source_group_idx on public.feed_sources(source_group_id);
create index if not exists feed_sources_source_user_idx on public.feed_sources(source_user_id);
create index if not exists group_messages_sender_idx on public.group_messages(sender_id);
create index if not exists notifications_actor_idx on public.notifications(actor_id);
create index if not exists notifications_event_idx on public.notifications(event_id);
create index if not exists notifications_group_idx on public.notifications(group_id);

alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated, public;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated, public;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated, public;
