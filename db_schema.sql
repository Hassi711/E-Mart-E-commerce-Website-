-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- PRODUCTS
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  images text[] default '{}',
  category text,
  stock integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Products
alter table products enable row level security;
create policy "Products are viewable by everyone." on products for select using (true);
create policy "Admins can insert products." on products for insert with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update products." on products for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can delete products." on products for delete using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ORDERS
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10,2) not null,
  shipping_address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Orders
alter table orders enable row level security;
create policy "Users can view own orders." on orders for select using (auth.uid() = user_id);
create policy "Admins can view all orders." on orders for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Users can create orders." on orders for insert with check (auth.uid() = user_id);

-- ORDER ITEMS
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  quantity integer not null,
  price decimal(10,2) not null
);

-- RLS for Order Items
alter table order_items enable row level security;
create policy "Users can view own order items." on order_items for select using (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
create policy "Admins can view all order items." on order_items for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Users can create order items." on order_items for insert with check (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

-- REVIEWS
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Reviews
alter table reviews enable row level security;
create policy "Reviews are viewable by everyone." on reviews for select using (true);
create policy "Users can create reviews." on reviews for insert with check (auth.uid() = user_id);

-- STORAGE BUCKETS (Script cannot create buckets directly in all environments, but policy: )
-- You must create a 'products' bucket in the Storage dashboard manually.
-- Policy for storage (if possible to run in SQL editor):
-- insert into storage.buckets (id, name) values ('products', 'products');
-- create policy "Public Access" on storage.objects for select using ( bucket_id = 'products' );
-- create policy "Admin Upload" on storage.objects for insert with check ( bucket_id = 'products' and exists (select 1 from profiles where id = auth.uid() and role = 'admin') );

-- Function to handle new user signup (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
