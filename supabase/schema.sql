-- ============================================================
-- FinLit Creator — Supabase Schema
-- Run this in the Supabase SQL editor: Dashboard > SQL Editor
-- ============================================================

-- Ideas
create table if not exists ideas (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  theme           text,
  community_tags  text[],
  status          text not null default 'draft'
                    check (status in ('draft', 'scheduled', 'in_progress', 'executed')),
  scheduled_date  date,
  holiday_link    text,
  milestone_stage_id text,
  milestone_topic_id text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Content points for each idea
create table if not exists content_points (
  id           uuid primary key default gen_random_uuid(),
  idea_id      uuid not null references ideas(id) on delete cascade,
  text         text not null,
  is_completed boolean not null default false,
  ai_generated boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- AI chat messages per idea
create table if not exists ai_messages (
  id         uuid primary key default gen_random_uuid(),
  idea_id    uuid not null references ideas(id) on delete cascade,
  role       text not null check (role in ('user', 'model')),
  content    text not null,
  created_at timestamptz not null default now()
);

-- Milestone progress — tracks which immigrant life-stage topics have been covered
create table if not exists milestone_progress (
  id         uuid primary key default gen_random_uuid(),
  stage_id   text not null,
  topic_id   text not null,
  status     text not null default 'not_started'
               check (status in ('not_started', 'in_progress', 'published')),
  idea_id    uuid references ideas(id) on delete set null,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stage_id, topic_id)
);

-- Notification & posting preferences (single-row settings)
create table if not exists notification_settings (
  id                  uuid primary key default gen_random_uuid(),
  platforms           text[] not null default array['youtube','instagram'],
  communities         text[] not null default array['general'],
  timezone            text not null default 'America/New_York',
  posting_days        text[] default array['tuesday','wednesday','thursday'],
  reminders_enabled   boolean not null default true,
  engagement_alerts   boolean not null default true,
  deadline_alerts     boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists ideas_updated_at on ideas;
create trigger ideas_updated_at
  before update on ideas
  for each row execute function set_updated_at();

drop trigger if exists milestone_progress_updated_at on milestone_progress;
create trigger milestone_progress_updated_at
  before update on milestone_progress
  for each row execute function set_updated_at();

drop trigger if exists notification_settings_updated_at on notification_settings;
create trigger notification_settings_updated_at
  before update on notification_settings
  for each row execute function set_updated_at();

-- Indexes
create index if not exists ideas_status_idx             on ideas(status);
create index if not exists ideas_scheduled_date_idx     on ideas(scheduled_date);
create index if not exists ideas_milestone_idx          on ideas(milestone_stage_id, milestone_topic_id);
create index if not exists content_points_idea_idx      on content_points(idea_id, sort_order);
create index if not exists ai_messages_idea_idx         on ai_messages(idea_id, created_at);
create index if not exists milestone_progress_stage_idx on milestone_progress(stage_id, topic_id);
