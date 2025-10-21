-- =====================================================
-- Migration: Create Row Level Security Policies
-- Description: RLS policies for all tables
-- Security model:
--   - Public read access to stores, flyers, categories, products, product_offers, price_history
--   - Admin-only access to extraction_logs, llm_logs, audit_logs
--   - Admin-only write access to operational tables
-- Author: Database Schema from db-plan.md
-- Date: 2025-10-21
-- =====================================================

-- =====================================================
-- RLS POLICIES: stores
-- Description: Public read access for all authenticated users
--              Admin write access for store management
-- =====================================================

-- Select policy for anon users
create policy "Allow anon read access to stores"
on stores for select
to anon
using (true);

-- Select policy for authenticated users
create policy "Allow authenticated read access to stores"
on stores for select
to authenticated
using (true);

-- Admin write policy (INSERT, UPDATE, DELETE)
create policy "Allow admin write access to stores"
on stores for all
to authenticated
using (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
)
with check (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
);

comment on policy "Allow anon read access to stores" on stores is 'Public read access for anonymous users';
comment on policy "Allow authenticated read access to stores" on stores is 'Public read access for authenticated users';
comment on policy "Allow admin write access to stores" on stores is 'Admin-only write access for store management';

-- =====================================================
-- RLS POLICIES: flyers
-- Description: Public read access for all authenticated users
--              Admin write access for flyer management
-- =====================================================

-- Select policy for anon users
create policy "Allow anon read access to flyers"
on flyers for select
to anon
using (true);

-- Select policy for authenticated users
create policy "Allow authenticated read access to flyers"
on flyers for select
to authenticated
using (true);

-- Admin write policy (INSERT, UPDATE, DELETE)
create policy "Allow admin write access to flyers"
on flyers for all
to authenticated
using (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
)
with check (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
);

comment on policy "Allow anon read access to flyers" on flyers is 'Public read access for anonymous users';
comment on policy "Allow authenticated read access to flyers" on flyers is 'Public read access for authenticated users';
comment on policy "Allow admin write access to flyers" on flyers is 'Admin-only write access for flyer management';

-- =====================================================
-- RLS POLICIES: categories
-- Description: Public read access for all authenticated users
--              Admin write access for category management
-- =====================================================

-- Select policy for anon users
create policy "Allow anon read access to categories"
on categories for select
to anon
using (true);

-- Select policy for authenticated users
create policy "Allow authenticated read access to categories"
on categories for select
to authenticated
using (true);

-- Admin write policy (INSERT, UPDATE, DELETE)
create policy "Allow admin write access to categories"
on categories for all
to authenticated
using (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
)
with check (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
);

comment on policy "Allow anon read access to categories" on categories is 'Public read access for anonymous users';
comment on policy "Allow authenticated read access to categories" on categories is 'Public read access for authenticated users';
comment on policy "Allow admin write access to categories" on categories is 'Admin-only write access for category management';

-- =====================================================
-- RLS POLICIES: products
-- Description: Public read access for all authenticated users
--              Admin write access for product management
-- =====================================================

-- Select policy for anon users
create policy "Allow anon read access to products"
on products for select
to anon
using (true);

-- Select policy for authenticated users
create policy "Allow authenticated read access to products"
on products for select
to authenticated
using (true);

-- Admin write policy (INSERT, UPDATE, DELETE)
create policy "Allow admin write access to products"
on products for all
to authenticated
using (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
)
with check (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
);

comment on policy "Allow anon read access to products" on products is 'Public read access for anonymous users';
comment on policy "Allow authenticated read access to products" on products is 'Public read access for authenticated users';
comment on policy "Allow admin write access to products" on products is 'Admin-only write access for product management';

-- =====================================================
-- RLS POLICIES: product_offers
-- Description: Public read access for all authenticated users
--              Admin write access for offer management
-- =====================================================

-- Select policy for anon users
create policy "Allow anon read access to product_offers"
on product_offers for select
to anon
using (true);

-- Select policy for authenticated users
create policy "Allow authenticated read access to product_offers"
on product_offers for select
to authenticated
using (true);

-- Admin write policy (INSERT, UPDATE, DELETE)
create policy "Allow admin write access to product_offers"
on product_offers for all
to authenticated
using (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
)
with check (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
);

comment on policy "Allow anon read access to product_offers" on product_offers is 'Public read access for anonymous users';
comment on policy "Allow authenticated read access to product_offers" on product_offers is 'Public read access for authenticated users';
comment on policy "Allow admin write access to product_offers" on product_offers is 'Admin-only write access for offer management';

-- =====================================================
-- RLS POLICIES: price_history
-- Description: Public read access for all authenticated users
--              Admin write access for price history management
-- =====================================================

-- Select policy for anon users
create policy "Allow anon read access to price_history"
on price_history for select
to anon
using (true);

-- Select policy for authenticated users
create policy "Allow authenticated read access to price_history"
on price_history for select
to authenticated
using (true);

-- Admin write policy (INSERT, UPDATE, DELETE)
create policy "Allow admin write access to price_history"
on price_history for all
to authenticated
using (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
)
with check (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
);

comment on policy "Allow anon read access to price_history" on price_history is 'Public read access for anonymous users';
comment on policy "Allow authenticated read access to price_history" on price_history is 'Public read access for authenticated users';
comment on policy "Allow admin write access to price_history" on price_history is 'Admin-only write access for price history management';

-- =====================================================
-- RLS POLICIES: extraction_logs
-- Description: Admin-only access to extraction logs
--              Sensitive operational data not for public consumption
-- =====================================================

-- Select policy for admin users only
create policy "Allow admin read access to extraction_logs"
on extraction_logs for select
to authenticated
using (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
);

-- Insert policy for admin users only
create policy "Allow admin insert access to extraction_logs"
on extraction_logs for insert
to authenticated
with check (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
);

comment on policy "Allow admin read access to extraction_logs" on extraction_logs is 'Admin-only read access to extraction logs';
comment on policy "Allow admin insert access to extraction_logs" on extraction_logs is 'Admin-only insert access for logging extraction events';

-- =====================================================
-- RLS POLICIES: llm_logs
-- Description: Admin-only access to LLM logs
--              Contains sensitive data about LLM requests/responses
-- =====================================================

-- Select policy for admin users only
create policy "Allow admin read access to llm_logs"
on llm_logs for select
to authenticated
using (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
);

-- Insert policy for admin users only
create policy "Allow admin insert access to llm_logs"
on llm_logs for insert
to authenticated
with check (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
);

comment on policy "Allow admin read access to llm_logs" on llm_logs is 'Admin-only read access to LLM logs';
comment on policy "Allow admin insert access to llm_logs" on llm_logs is 'Admin-only insert access for logging LLM requests';

-- =====================================================
-- RLS POLICIES: audit_logs
-- Description: Admin-only read access to audit logs
--              Write access handled by triggers (security definer functions)
-- =====================================================

-- Select policy for admin users only
create policy "Allow admin read access to audit_logs"
on audit_logs for select
to authenticated
using (
    exists (
        select 1 from auth.users
        where auth.uid() = id
        and raw_user_meta_data->>'role' = 'admin'
    )
);

comment on policy "Allow admin read access to audit_logs" on audit_logs is 'Admin-only read access to audit logs (writes handled by triggers)';

-- =====================================================
-- NOTE: Service Role Access
-- Backend services using the service_role key will bypass RLS entirely.
-- This allows automated processes to write to tables without RLS restrictions.
-- Ensure service_role key is kept secure and only used server-side.
-- =====================================================

