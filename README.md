# Doit — Menos pantalla. Más vida real.

A calm, mobile-first social planner built with Next.js, Supabase and PostgreSQL RLS. Doit helps people turn conversations into real-world plans, private groups and shared activities. It deliberately avoids infinite scrolling, vanity metrics and advertising.

## App capabilities
- Email/password authentication and personal profiles.
- Mutual connections and explicitly curated feed sources.
- Event creation, editing, cancellation, private invitations and RSVP.
- Private groups, member management and group chat.
- In-app notifications and configurable daily usage limits.
- Responsive desktop and mobile-first navigation.

## Setup
See the full application source and Supabase migration. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in your environment. Run `supabase/migrations/0001_doit_core.sql` in the Supabase SQL editor before authenticating users.

Never expose a Supabase service-role/secret key in client-side code. All database tables are protected with row-level security.