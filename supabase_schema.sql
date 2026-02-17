-- Create order_status_history table
create table if not exists public.order_status_history (
    id uuid not null default extensions.uuid_generate_v4(),
    order_id uuid not null references orders(id) on delete cascade,
    status text not null check (status in ('pending','processing','shipped','delivered','cancelled')),
    changed_by uuid not null, -- admin user id
    changed_at timestamp with time zone not null default timezone('utc', now()),
    constraint order_status_history_pkey primary key(id)
);

-- Policy to allow users to view history of their own orders
create policy "Users can view their order history"
  on order_status_history for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_status_history.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Policy to allow admins to insert history
create policy "Admins can insert order history"
  on order_status_history for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
