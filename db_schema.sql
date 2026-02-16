-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- *** CLEANUP SECTION (Run this to reset schema) ***
-- Drop defined triggers and functions to avoid conflicts
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.create_order_with_items(jsonb, jsonb);

-- Drop tables (Cascade to drop dependent foreign keys and RLS policies)
drop table if exists reviews cascade;
drop table if exists order_items cascade;
drop table if exists orders cascade;
drop table if exists products cascade;
drop table if exists categories cascade;
drop table if exists profiles cascade;


-- *** CREATION SECTION ***

-- 1. PROFILES (Users)
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
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Function to handle new user signup (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'customer');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. CATEGORIES
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Categories
alter table categories enable row level security;
create policy "Active categories are viewable by everyone." on categories for select using (is_active = true or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can manage categories." on categories for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));


-- 3. PRODUCTS
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null check (price >= 0),
  category_id uuid references categories(id) on delete set null,
  stock integer default 0 check (stock >= 0),
  images text[] default '{}',
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for Products
create index idx_products_category on products(category_id);
create index idx_products_is_active on products(is_active);

-- RLS for Products
alter table products enable row level security;
create policy "Active products are viewable by everyone." on products for select using (is_active = true or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can manage products." on products for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));


-- 4. ORDERS
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10,2) not null check (total_amount >= 0),
  shipping_address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for Orders
create index idx_orders_user_id on orders(user_id);

-- RLS for Orders
alter table orders enable row level security;
create policy "Users can view own orders." on orders for select using (auth.uid() = user_id);
create policy "Admins can view all orders." on orders for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update orders." on orders for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
-- Strict Rule: Customers CANNOT insert directly. Must use function.
create policy "No direct insert for users" on orders for insert with check (false); 


-- 5. ORDER ITEMS
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  quantity integer not null check (quantity > 0),
  price decimal(10,2) not null check (price >= 0)
);

-- Index for Order Items
create index idx_order_items_product_id on order_items(product_id);

-- RLS for Order Items
alter table order_items enable row level security;
create policy "Users can view own order items." on order_items for select using (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
create policy "Admins can view all order items." on order_items for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "No direct insert for users on items" on order_items for insert with check (false);


-- 6. REVIEWS
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- RLS for Reviews
alter table reviews enable row level security;
create policy "Reviews are viewable by everyone." on reviews for select using (true);
-- Policy: Insert only if user purchased product
create policy "Users can create reviews for purchased products." on reviews for insert with check (
  auth.uid() = user_id 
  and exists (
    select 1 
    from order_items oi
    join orders o on oi.order_id = o.id
    where o.user_id = auth.uid()
    and oi.product_id = reviews.product_id
  )
);
create policy "Users can update own reviews." on reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews." on reviews for delete using (auth.uid() = user_id);


-- 7. STORAGE POLICIES
-- Apply these in SQL Editor manually if needed, or check if they exist first.
-- The Policies below assume appropriate buckets exist.

-- Note: Storage policies are often best managed via the Supabase UI or distinct migration files if running locally.
-- For completeness in SQL Editor:
-- create policy "Public Access" on storage.objects for select using ( bucket_id = 'products' );
-- create policy "Admin Upload" on storage.objects for insert with check ( bucket_id = 'products' and exists (select 1 from profiles where id = auth.uid() and role = 'admin') );
-- create policy "Admin Delete" on storage.objects for delete using ( bucket_id = 'products' and exists (select 1 from profiles where id = auth.uid() and role = 'admin') );


-- 8. FUNCTIONS FOR INVENTORY MANAGEMENT

-- Function to place an order atomically
create or replace function create_order_with_items(
  items_json jsonb,
  shipping_address jsonb
) returns uuid as $$
declare
  new_order_id uuid;
  item jsonb;
  product_record record;
  total_cost decimal(10,2) := 0;
  current_user_id uuid;
begin
  current_user_id := auth.uid();
  
  if current_user_id is null then
    raise exception 'User not authenticated';
  end if;

  -- 1. Create the order initially with 0 total
  insert into orders (user_id, total_amount, status, shipping_address)
  values (current_user_id, 0, 'pending', shipping_address)
  returning id into new_order_id;

  -- 2. Iterate through items
  for item in select * from jsonb_array_elements(items_json)
  loop
    -- Lock the product row for update to prevent race conditions
    select * into product_record from products where id = (item->>'product_id')::uuid for update;

    if not found then
      raise exception 'Product % not found', item->>'product_id';
    end if;

    if product_record.stock < (item->>'quantity')::int then
      raise exception 'Insufficient stock for product %', product_record.name;
    end if;

    -- Deduct stock
    update products 
    set stock = stock - (item->>'quantity')::int
    where id = (item->>'product_id')::uuid;

    -- Add to order items
    insert into order_items (order_id, product_id, quantity, price)
    values (new_order_id, (item->>'product_id')::uuid, (item->>'quantity')::int, product_record.price);

    -- Accumulate total
    total_cost := total_cost + (product_record.price * (item->>'quantity')::int);
  end loop;

  -- 3. Update order total
  update orders set total_amount = total_cost where id = new_order_id;

  return new_order_id;
end;
$$ language plpgsql security definer;
