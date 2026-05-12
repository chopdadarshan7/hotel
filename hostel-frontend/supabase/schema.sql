create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'guest' check (role in ('guest', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'guest')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create table if not exists public.rooms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text check (type in ('dorm','private','deluxe')),
  description text,
  price_per_night numeric not null,
  max_guests int,
  bed_type text,
  amenities text[],
  images text[],
  available boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  guest_name text not null,
  email text not null,
  phone text,
  room_id uuid references public.rooms(id) on delete set null,
  check_in date not null,
  check_out date not null,
  guests_count int default 1,
  special_requests text,
  total_price numeric,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz default now()
);

create table if not exists public.gallery (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  caption text,
  category text check (category in ('rooms','common','events','food')),
  created_at timestamptz default now()
);

create table if not exists public.contacts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  message text,
  created_at timestamptz default now()
);

create or replace function public.check_room_availability(
  p_room_id uuid,
  p_check_in date,
  p_check_out date
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.bookings
    where room_id = p_room_id
      and status in ('pending', 'confirmed')
      and check_in < p_check_out
      and check_out > p_check_in
  );
$$;

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;
alter table public.gallery enable row level security;
alter table public.contacts enable row level security;

drop policy if exists "Public can read rooms" on public.rooms;
create policy "Public can read rooms"
on public.rooms for select
using (true);

drop policy if exists "Admins can manage rooms" on public.rooms;
create policy "Admins can manage rooms"
on public.rooms for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can create bookings" on public.bookings;
create policy "Public can create bookings"
on public.bookings for insert
with check (true);

drop policy if exists "Admins can read bookings" on public.bookings;
create policy "Admins can read bookings"
on public.bookings for select
using (public.is_admin());

drop policy if exists "Admins can manage bookings" on public.bookings;
create policy "Admins can manage bookings"
on public.bookings for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read gallery" on public.gallery;
create policy "Public can read gallery"
on public.gallery for select
using (true);

drop policy if exists "Admins can manage gallery" on public.gallery;
create policy "Admins can manage gallery"
on public.gallery for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can send contact messages" on public.contacts;
create policy "Public can send contact messages"
on public.contacts for insert
with check (true);

drop policy if exists "Admins can read contacts" on public.contacts;
create policy "Admins can read contacts"
on public.contacts for select
using (public.is_admin());

drop policy if exists "Admins can read profiles" on public.profiles;
create policy "Admins can read profiles"
on public.profiles for select
using (public.is_admin() or id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

insert into storage.buckets (id, name, public)
values ('room-images', 'room-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view room images" on storage.objects;
create policy "Public can view room images"
on storage.objects for select
using (bucket_id in ('room-images', 'gallery-images'));

drop policy if exists "Admins can upload room images" on storage.objects;
create policy "Admins can upload room images"
on storage.objects for insert
with check (
  public.is_admin()
  and bucket_id in ('room-images', 'gallery-images')
);

drop policy if exists "Admins can update room images" on storage.objects;
create policy "Admins can update room images"
on storage.objects for update
using (
  public.is_admin()
  and bucket_id in ('room-images', 'gallery-images')
)
with check (
  public.is_admin()
  and bucket_id in ('room-images', 'gallery-images')
);

drop policy if exists "Admins can delete room images" on storage.objects;
create policy "Admins can delete room images"
on storage.objects for delete
using (
  public.is_admin()
  and bucket_id in ('room-images', 'gallery-images')
);
