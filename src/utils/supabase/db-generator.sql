-- ───────────────────────────────────────────────
-- 1. Essentials & extensions
-- ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";         -- for uuid_generate_v4()

-- ───────────────────────────────────────────────
-- 2. Lookup tables (open to everyone)
-- ───────────────────────────────────────────────
create table public.languages (
  id     serial primary key,
  name   text   not null unique
);

insert into public.languages (name) values ('Spanish');        -- seed first language

create table public.sources (
  id     serial primary key,
  name   text   not null unique
);

insert into public.sources (name) values
  ('Netflix'),
  ('YouTube'),
  ('Other');

-- ───────────────────────────────────────────────
-- 3. Enum type for vocab status
-- ───────────────────────────────────────────────
create type public.vocab_status as enum ('hard', 'learned');

-- ───────────────────────────────────────────────
-- 4. Main table: vocab_items
--    • Uses `status` enum instead of two booleans
--    • Tracks “hard” vs “learned” via status DEFAULT 'hard'
-- ───────────────────────────────────────────────
create table public.vocab_items (
  id              uuid            primary key default uuid_generate_v4(),
  user_id         uuid            not null references auth.users(id) on delete cascade,
  entry_type      text            not null check (entry_type in ('word', 'sentence')),
  content         text            not null,
  language_id     int             not null references public.languages(id),
  source_id       int             references public.sources(id),
  source_details  text,
  status          public.vocab_status not null default 'hard',
  created_at      timestamptz     not null default now()
);

-- ───────────────────────────────────────────────
-- 5. Row-Level Security (RLS)
--    • Each user can see and modify only their own rows
-- ───────────────────────────────────────────────
alter table public.vocab_items enable row level security;

create policy "vocab_items_user_isolation"
  on public.vocab_items
  for all                                    -- SELECT, INSERT, UPDATE, DELETE
  using      (user_id = auth.uid())          -- who can *access* a row
  with check (user_id = auth.uid());         -- who can *create/modify* a row