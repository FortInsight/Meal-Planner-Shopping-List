create table if not exists public.meal_planner_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  planner_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.meal_planner_states enable row level security;

create policy "Users can view their own planner state"
on public.meal_planner_states
for select
using (auth.uid() = user_id);

create policy "Users can insert their own planner state"
on public.meal_planner_states
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own planner state"
on public.meal_planner_states
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
