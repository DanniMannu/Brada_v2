create extension if not exists "pgcrypto";

create table registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  status text default 'pending',
  name text not null,
  nuit text not null,                
  type text,
  email text,
  phone text,
  location text,
  stores integer,
  delivery_type text,
  coverage text,
  delivery_fee text,
  delivery_time text,
  payment_method text,
  mobile_number text,
  bank_name text,
  bank_nib text,
  owner_name text,
  owner_email text,
  agreed boolean default false
);




create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  created_at timestamp with time zone default now()
);

create table menus (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registrations(id) on delete cascade,
  name text not null,
  description text,
  price text,
  created_at timestamp with time zone default now()
);

create table menu_images (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references menus(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  created_at timestamp with time zone default now()
);


create table licenses (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null
    references registrations(id) on delete cascade,
  type text not null
    check (type in ('operating', 'sanitary')),
  file_name text not null,
  file_url text not null,
  issued_at date,
  expires_at date,
  status text default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamp with time zone default now()
);

create table email_logs (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid
    references registrations(id) on delete cascade,
  email_type text not null
    check (email_type in (
      'registration',
      'password_recovery',
      'notification'
    )),
  recipient text not null,
  status text default 'pending'
    check (status in ('pending', 'sent', 'failed')),
  error_message text,
  sent_at timestamp with time zone,
  attempt_count integer default 0,
  created_at timestamp with time zone default now()
);


--bloqueio de conta após 3 tentativas
create table if not exists login_attempts (
  email text primary key,
  attempt_count integer default 0,
  blocked_until timestamp
);

create table courier_applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  bi_url text,
  criminal_record_url text,
  license_url text,
  vehicle_doc_url text,
  vehicle_type text,
  plate text,
  availability text,
  location text,
  thermal_bag_photo text,
  status text default 'pending',
  created_at timestamp default now()
);




create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id),
  product_name text,
  quantity int,
  price numeric
);

create table customers (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text,
  phone text,
  created_at timestamp default now()
);


create table drivers (
  id uuid primary key default uuid_generate_v4(),
  name text,
  phone text,
  status text default 'available'
);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null,
  customer_id uuid not null,
  driver_id uuid null, -- ✅ PODE SER NULL
  total numeric,
  status text default 'pending',
  created_at timestamp default now()
);


create table user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  role text, -- 'customer', 'restaurant', 'driver'
  created_at timestamp default now()
);


create table establishments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  contact text not null,
  stores int,
  nuit int,
  address text,
  owner_name text,
  email text,
  created_at timestamp default now()
);

-- PRODUCTS
create table products (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid,
  name text not null,
  description text,
  category text,
  price numeric,
  active boolean default true,
  created_at timestamp default now()
);

-- MENUS
create table menus (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid,
  name text not null,
  description text,
  price numeric,
  active boolean default true,
  created_at timestamp default now()
);

-- MENU ↔ PRODUCTS (relação N:N)
create table menu_products (
  id uuid primary key default uuid_generate_v4(),
  menu_id uuid references menus(id) on delete cascade,
  product_id uuid references products(id) on delete cascade
);

-- PROMOTIONS
create table promotions (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid,
  title text,
  description text,
  price numeric,
  discount numeric,
  active boolean default true,
  created_at timestamp default now()
);

create table promotions_products (
  id uuid primary key default uuid_generate_v4(),
  promotions_id uuid references promotions(id) on delete cascade,
  product_id uuid references products(id) on delete cascade
);

create policy "read products"
on products
for select
using (true);


create policy "read menus"
on menus
for select
using (true);

create policy "read menu_products"
on menu_products
for select
using (true);

create policy "read promotions"
on promotions
for select
using (true);

create policy "read promotions_products"
on promotions_products
for select
using (true);

create policy "update own promotions"
on public.promotions
for update
to authenticated
using (
  establishment_id IN (
    select id from establishments
    where user_id = auth.uid()
  )
)
with check (
  establishment_id IN (
    select id from establishments
    where user_id = auth.uid()
  )
);