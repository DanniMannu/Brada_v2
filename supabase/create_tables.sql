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


create table products (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registrations(id) on delete cascade,
  name text not null,
  description text,
  category text,
  price text,
  created_at timestamp with time zone default now()
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

create table menu_products (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null
    references menus(id) on delete cascade,
  product_id uuid not null
    references products(id) on delete cascade,
  position integer,
  created_at timestamp with time zone default now(),
  unique (menu_id, product_id)
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