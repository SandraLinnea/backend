--Insert data users
INSERT into users (name, email, password_hash, is_admin)
values
  ('Alice Andersson', 'alice@example.com', '$2a$10$WQ2kR8OeHgM4fX8I8b4cmeKe7Eef0/9ZrTzMZCwRDP3l4E6KPg.E2', false),
  ('Bob Bergström', 'bob@example.com', '$2a$10$Z6yJt8QpdWc4iUQqMRmTLeP1IElRQ1Z.kts1OYJpvCkPiP8nBkZb2', false),
  ('Clara Claesson', 'clara@example.com', '$2a$10$F8xYJbKzNxl97Z0A1b8hjOiM4rFqD4nCzR/NzN9wNn7sZEVH1GVCW', false),
  ('David Dahl', 'david@example.com', '$2a$10$3lQ.qf82hxiT9J7E69KuLe1RS40RkEiFQlKdyIo6OPsWv8BW6vDmO', true),
  ('Ella Engström', 'ella@example.com', '$2a$10$yzqz7f9YxWz.TnD/MjUyYeVDdS6zOK3PXz8vBf0aPiWykvK7NlkPy', false),
  ('Filip Forsberg', 'filip@example.com', '$2a$10$7iMJhLJgHke0V6ku6rH7yOZJ0x9h3DT9e1M6qD5phdRR9LRZzI2qO', false),
  ('Greta Gustafsson', 'greta@example.com', '$2a$10$h62z5ZC6zuepWqvPBbQKgeuOEWfX26MR3vDjngE9xOoxAmc3J0l2G', true),
  ('Hugo Holm', 'hugo@example.com', '$2a$10$QbH6klyf4U1aIcbX5hhiBeWg4ak6Dvu4vQe5KTqZ/oZpP4s6xpmue', false),
  ('Ida Isaksson', 'ida@example.com', '$2a$10$EoKkkShxvZMb1aK/tIzGEu9ef4PfnRpejIYpDp5HqJfKht2cLf2nW', false),
  ('Jonas Johansson', 'jonas@example.com', '$2a$10$Jr7cCrX8NuwB/hbMR5nlLeY7E4mSYX5YpYuhqMceJDCivupfCKEWe', true);

-- Table property
  property:
create table if not exists public.properties (
  property_id text primary key default public.make_property_id(),
  title text not null,
  description text,
  city text,
  country text,
  price_per_night numeric(12,2) not null check (price_per_night > 0),
  availability boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_id_not_empty check (length(trim(coalesce(property_id,''))) > 0)
);

--Trigger for updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- insert data properties
insert into public.properties
(property_id, title, description, city, country, price_per_night, availability)
values
('PROP-000010001','Modern studio i centrala Stockholm','Ljus studio nära tunnelbanan','Stockholm','SE',950.00,true),
('PROP-000010002','Mysig tvåa vid Avenyn','Nära restauranger och nattliv','Göteborg','SE',890.00,true),
('PROP-000010003','Havsutsikt i Västra Hamnen','Balkong med kvällssol','Malmö','SE',1050.00,true),
('PROP-000010004','Studentvänlig etta','Tyst område nära uni','Uppsala','SE',650.00,true),
('PROP-000010005','Fjällstuga med bastu','Perfekt för vinterhelg','Åre','SE',1400.00,false),
('PROP-000010006','Loft i Gamla Stan','Charmigt med synliga bjälkar','Stockholm','SE',1300.00,false),
('PROP-000010007','Skärgårdshus på Vaxholm','Egen brygga','Vaxholm','SE',1700.00,true),
('PROP-000010008','Nyproducerad trea','Garageplats ingår','Lund','SE',980.00,true),
('PROP-000010009','Compact living nära hamnen','Smart planlösning','Helsingborg','SE',720.00,true),
('PROP-000010010','Rustik stuga i Dalarna','Öppen spis och natur','Mora','SE',800.00,true),
('PROP-000010011','Penthouse med terrass','Utsikt över operan','Oslo','NO',2200.00,false),
('PROP-000010012','Hygge-lägenhet på Nørrebro','Café runt hörnet','København','DK',1500.00,true),
('PROP-000010013','Designflat i Kallio','Nära metro','Helsinki','FI',1200.00,true),
('PROP-000010014','Altbau i Prenzlauer Berg','Högt i tak, trägolv','Berlin','DE',1100.00,true),
('PROP-000010015','Strandnära i Barceloneta','2 min till stranden','Barcelona','ES',1350.00,true),
('PROP-000010016','Trastevere charm','Genuint kvarter','Roma','IT',1250.00,false),
('PROP-000010017','Marais pied-à-terre','Ljus innergård','Paris','FR',1900.00,true),
('PROP-000010018','Victorian i Shoreditch','Nära Overground','London','GB',2100.00,true),
('PROP-000010019','SoMa micro-loft','Cowork runt hörnet','San Francisco','US',2400.00,false),
('PROP-000010020','Brooklyn brownstone room','Trädallé utanför','New York','US',1800.00,true),
('PROP-000010021','Ribeira river view','Balkong mot Douro','Porto','PT',900.00,true),
('PROP-000010022','Jordaan canal apt','Mysig kanalutsikt','Amsterdam','NL',1600.00,true),
('PROP-000010023','Geotermal getaway','Nära Blå Lagunen','Grindavík','IS',1500.00,false),
('PROP-000010024','Chalet nära sjö','Perfekt för vandring','Interlaken','CH',2000.00,true),
('PROP-000010025','Kaffehus-lägenhet','Spårvagn utanför','Wien','AT',1200.00,true),
('PROP-000010026','Plaka studio','Steg från Akropolis','Athina','GR',950.00,true),
('PROP-000010027','Dubrovnik old town nest','Historisk charm','Dubrovnik','HR',1150.00,true),
('PROP-000010028','Karlín loft','Tyst innergård','Praha','CZ',1000.00,true),
('PROP-000010029','Kazimierz nook','Kreativt område','Kraków','PL',850.00,true),
('PROP-000010030','Baltic sea view','Högst upp i huset','Tallinn','EE',800.00,true);



-- Trigger for booking
-- Extensions
create extension if not exists pgcrypto;     -- för gen_random_uuid()
create extension if not exists btree_gist;   -- för EXCLUDE på daterange

-- 1) Tabell
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_id text unique,                          -- läsbart id (BOOK-...)
  user_id uuid not null,                           -- auth.users.id
  property_id uuid not null references public.properties(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  guests int not null default 1,
  note text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  total_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

-- 2) Grundregler
alter table public.bookings
  add constraint bookings_date_order check (end_date > start_date);

-- Förhindra överlapp för samma property när bokning inte är "cancelled"
-- daterange är [start, end) för normal hotell-logik
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    property_id with =,
    daterange(start_date, end_date, '[)') with &&
  )
  where (status in ('pending','confirmed'));

-- 3) Sekvens + generator för läsbart ID
create sequence if not exists public.booking_id_seq;

create or replace function public.make_booking_id()
returns text language plpgsql as $$
declare n bigint;
begin
  n := nextval('public.booking_id_seq');
  return 'BOOK-' || lpad(n::text, 7, '0');
end; $$;

-- 4) Trigger: sätt booking_id + total_price automatiskt
create or replace function public.set_booking_defaults()
returns trigger language plpgsql as $$
declare
  nightly numeric(12,2);
  nights int;
begin
  -- booking_id
  if new.booking_id is null or new.booking_id = '' then
    new.booking_id := public.make_booking_id();
  end if;

  -- total_price = (antal nätter) * price_per_night från properties
  select price_per_night::numeric into nightly
  from public.properties
  where id = new.property_id;

  nights := greatest( (new.end_date - new.start_date), 0);
  if nightly is null then nightly := 0; end if;
  new.total_price := (nights * nightly);

  return new;
end; $$;

drop trigger if exists trg_set_booking_defaults on public.bookings;
create trigger trg_set_booking_defaults
before insert or update on public.bookings
for each row execute function public.set_booking_defaults();

-- 5) Synka sekvens ifall du importerat data tidigare
select setval('public.booking_id_seq',
  (select coalesce(max((regexp_replace(booking_id, '^BOOK-','')::bigint)),0)+1 from public.bookings),
  false);

-- 6) (Valfritt) RLS – enkel läspolicy (anpassa efter behov)
alter table public.bookings enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='bookings' and policyname='bookings_select') then
    create policy bookings_select on public.bookings
    for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='bookings' and policyname='bookings_insert') then
    create policy bookings_insert on public.bookings
    for insert to authenticated with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='bookings' and policyname='bookings_update') then
    create policy bookings_update on public.bookings
    for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='bookings' and policyname='bookings_delete') then
    create policy bookings_delete on public.bookings
    for delete to authenticated using (auth.uid() = user_id);
  end if;
end $$;
