-- ============================================================
-- Migration 013: Docs portal — email magic-link access
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
--
-- /documents used to sit behind one shared password. Visitors now enter
-- their email, get a sign-in link, and every confirmed address lands here,
-- so we know who looked at the company documents. The pms_* columns are an
-- outbox for handing these contacts to the company PMS — see
-- docs/tasks/DOCS_EMAIL_TO_PMS_RU.md.
-- Idempotent — safe to re-run.
-- ============================================================

-- ── 1. Contacts (one row per email) ──────────────────────────
create table if not exists public.document_contacts (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,              -- always stored lowercased
  name text,
  company text,
  source text not null default 'docs_portal',
  first_seen_at timestamptz not null default now(),
  verified_at timestamptz,                 -- first click on a sign-in link
  last_login_at timestamptz,
  login_count int not null default 0,
  download_count int not null default 0,
  last_country text,
  last_ip text,
  last_user_agent text,
  first_referrer text,
  -- PMS hand-off outbox: 'pending' until the contact reaches the PMS.
  pms_sync_status text not null default 'pending'
    check (pms_sync_status in ('pending', 'synced', 'failed', 'skipped')),
  pms_synced_at timestamptz,
  pms_external_id text,
  pms_last_error text,
  pms_attempts int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_document_contacts_last_login on public.document_contacts(last_login_at desc nulls last);
create index if not exists idx_document_contacts_pms on public.document_contacts(pms_sync_status)
  where pms_sync_status in ('pending', 'failed');

drop trigger if exists on_document_contacts_updated on public.document_contacts;
create trigger on_document_contacts_updated
  before update on public.document_contacts
  for each row execute function public.handle_updated_at();

-- ── 2. Access log (link requests, logins, downloads) ─────────
create table if not exists public.document_access_events (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.document_contacts(id) on delete cascade,
  email text not null,
  event text not null check (event in ('link_requested', 'login', 'download')),
  document_slug text,
  ip text,
  user_agent text,
  country text,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists idx_document_events_created on public.document_access_events(created_at desc);
create index if not exists idx_document_events_contact on public.document_access_events(contact_id, created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- Personal data: written only server-side through the service-role client,
-- readable only by signed-in admins (/admin/documents).
-- ============================================================
alter table public.document_contacts enable row level security;
alter table public.document_access_events enable row level security;

drop policy if exists "Admins can view document contacts" on public.document_contacts;
create policy "Admins can view document contacts" on public.document_contacts
  for select using (auth.role() = 'authenticated');

drop policy if exists "Admins can view document access events" on public.document_access_events;
create policy "Admins can view document access events" on public.document_access_events
  for select using (auth.role() = 'authenticated');
