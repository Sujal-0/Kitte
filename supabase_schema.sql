-- ==============================================================================
-- KITTE TIME CAPSULE STUDIO - PRODUCTION DATABASE SCHEMA
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://app.supabase.com)
-- This creates the persistent archival table and indexes for scheduled time letters.
-- ==============================================================================

create table if not exists public.time_capsule_letters (
  id text primary key,
  recipient_email text not null,
  author text,
  salutation text,
  delivery_date text not null,
  target_timestamp bigint not null,
  send_date text not null,
  subject text not null,
  share_url text not null,
  html_content text not null,
  confirm_html_content text,
  plain_text_content text,
  attachments jsonb default '[]'::jsonb,
  state jsonb not null default '{}'::jsonb,
  status text not null default 'scheduled', -- 'scheduled', 'delivered', 'failed'
  cloud_scheduled boolean default false,
  confirmation_sent boolean default false,
  resend_id text,
  delivered_at timestamptz,
  created_at timestamptz default now()
);

-- Index for daily cron checks: instantly find letters due today
create index if not exists idx_letters_due_dispatch 
  on public.time_capsule_letters (target_timestamp, status) 
  where status = 'scheduled';

-- Enable Row Level Security (RLS)
alter table public.time_capsule_letters enable row level security;

-- Policy 1: Allow public app to insert new scheduled letters
create policy "Allow insert of new letters" 
  on public.time_capsule_letters 
  for insert 
  with check (true);

-- Policy 2: Allow reading letters via ID or for delivery dispatch
create policy "Allow select letters" 
  on public.time_capsule_letters 
  for select 
  using (true);

-- Policy 3: Allow service role (or backend) to update delivery status
create policy "Allow update for status" 
  on public.time_capsule_letters 
  for update 
  using (true);

