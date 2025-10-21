-- =====================================================
-- Migration: Create Base Tables
-- Description: Initial database schema for DealSpotter MVP
-- Tables: stores, flyers, categories, products, product_offers, price_history
-- Author: Database Schema from db-plan.md
-- Date: 2025-10-21
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Enable unaccent for text normalization (optional, for future use)
create extension if not exists "unaccent";

-- =====================================================
-- TABLE: stores
-- Description: Discount stores (Biedronka, Lidl)
-- =====================================================

create table stores (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null unique,
    slug varchar(100) not null unique,
    logo_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS for stores table
alter table stores enable row level security;

comment on table stores is 'Discount grocery stores';
comment on column stores.id is 'Unique store identifier';
comment on column stores.name is 'Store name (e.g., "Biedronka", "Lidl")';
comment on column stores.slug is 'URL-friendly slug (e.g., "biedronka", "lidl")';
comment on column stores.logo_url is 'URL to store logo image';

-- =====================================================
-- TABLE: flyers
-- Description: Promotional flyers from stores
-- =====================================================

create table flyers (
    id uuid primary key default gen_random_uuid(),
    store_id uuid not null references stores(id) on delete restrict,
    issue_date date not null,
    valid_from date not null,
    valid_to date not null,
    source_url text,
    extraction_status varchar(50) not null default 'pending',
    extraction_completed_at timestamptz,
    error_count integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    
    -- Constraints
    constraint unique_store_issue_date unique(store_id, issue_date),
    constraint check_valid_date_range check(valid_from <= valid_to),
    constraint check_extraction_status check(extraction_status in ('pending', 'in_progress', 'completed', 'failed'))
);

-- Enable RLS for flyers table
alter table flyers enable row level security;

comment on table flyers is 'Promotional flyers retrieved from stores';
comment on column flyers.store_id is 'Store that published this flyer';
comment on column flyers.issue_date is 'Date when flyer was issued';
comment on column flyers.valid_from is 'Start date of promotion period';
comment on column flyers.valid_to is 'End date of promotion period';
comment on column flyers.source_url is 'Source URL of PDF flyer (may point to Supabase Storage)';
comment on column flyers.extraction_status is 'Status of data extraction process';
comment on column flyers.extraction_completed_at is 'Timestamp when extraction was completed';
comment on column flyers.error_count is 'Number of errors during extraction';

-- =====================================================
-- TABLE: categories
-- Description: Product categories (flat structure, no hierarchy)
-- =====================================================

create table categories (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null unique,
    slug varchar(100) not null unique,
    icon varchar(50),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS for categories table
alter table categories enable row level security;

comment on table categories is 'Product categories (flat structure without hierarchy)';
comment on column categories.name is 'Category name (e.g., "Nabiał", "Pieczywo")';
comment on column categories.slug is 'URL-friendly slug';
comment on column categories.icon is 'Icon name (optional)';

-- =====================================================
-- TABLE: products
-- Description: Product catalog (prices are in product_offers)
-- =====================================================

create table products (
    id uuid primary key default gen_random_uuid(),
    name varchar(255) not null,
    normalized_name varchar(255) not null,
    category_id uuid references categories(id) on delete restrict,
    brand varchar(100),
    unit varchar(50),
    description text,
    image_url text,
    search_vector tsvector generated always as (
        to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, ''))
    ) stored,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    
    -- Constraints
    constraint unique_product_name_brand unique(normalized_name, brand)
);

-- Enable RLS for products table
alter table products enable row level security;

comment on table products is 'Product catalog (base products without prices)';
comment on column products.name is 'Product name';
comment on column products.normalized_name is 'Normalized name (lowercase, no special characters)';
comment on column products.category_id is 'Product category';
comment on column products.brand is 'Product brand';
comment on column products.unit is 'Unit of measure (e.g., "szt", "kg", "l")';
comment on column products.description is 'Product description';
comment on column products.image_url is 'URL to product image';
comment on column products.search_vector is 'Full-text search vector using simple configuration (language-agnostic)';

-- =====================================================
-- TABLE: product_offers
-- Description: Promotional offers from specific flyers
-- =====================================================

create table product_offers (
    id uuid primary key default gen_random_uuid(),
    flyer_id uuid not null references flyers(id) on delete cascade,
    product_id uuid not null references products(id) on delete restrict,
    promo_price decimal(10,2) not null,
    regular_price decimal(10,2),
    discount_percentage decimal(5,2),
    conditions jsonb,
    valid_from date not null,
    valid_to date not null,
    page_number integer,
    extraction_confidence decimal(5,4),
    manually_verified boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    
    -- Constraints
    constraint unique_flyer_product unique(flyer_id, product_id),
    constraint check_promo_price_positive check(promo_price > 0),
    constraint check_regular_price_higher check(regular_price is null or regular_price >= promo_price),
    constraint check_discount_range check(discount_percentage is null or (discount_percentage >= 0 and discount_percentage <= 100)),
    constraint check_valid_date_range check(valid_from <= valid_to),
    constraint check_confidence_range check(extraction_confidence is null or (extraction_confidence >= 0 and extraction_confidence <= 1)),
    constraint check_conditions_is_object check(conditions is null or jsonb_typeof(conditions) = 'object')
);

-- Enable RLS for product_offers table
alter table product_offers enable row level security;

comment on table product_offers is 'Promotional offers from specific flyers';
comment on column product_offers.flyer_id is 'Source flyer for this offer';
comment on column product_offers.product_id is 'Product on promotion';
comment on column product_offers.promo_price is 'Promotional price';
comment on column product_offers.regular_price is 'Regular price (before promotion)';
comment on column product_offers.discount_percentage is 'Discount percentage';
comment on column product_offers.conditions is 'Promotion conditions (e.g., {"min_quantity": 2, "loyalty_card": true})';
comment on column product_offers.valid_from is 'Start date of promotion';
comment on column product_offers.valid_to is 'End date of promotion';
comment on column product_offers.page_number is 'Page number in flyer';
comment on column product_offers.extraction_confidence is 'Extraction confidence score (0.0-1.0)';
comment on column product_offers.manually_verified is 'Whether offer was manually verified';

-- =====================================================
-- TABLE: price_history
-- Description: Price history for products (optional table for tracking price changes)
-- =====================================================

create table price_history (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references products(id) on delete cascade,
    store_id uuid not null references stores(id) on delete cascade,
    price decimal(10,2) not null,
    price_type varchar(20) not null,
    valid_from date not null,
    valid_to date,
    source_offer_id uuid references product_offers(id) on delete set null,
    created_at timestamptz not null default now(),
    
    -- Constraints
    constraint check_price_positive check(price > 0),
    constraint check_price_type check(price_type in ('promo', 'regular')),
    constraint check_valid_date_range check(valid_to is null or valid_from <= valid_to)
);

-- Enable RLS for price_history table
alter table price_history enable row level security;

comment on table price_history is 'Historical price tracking for products';
comment on column price_history.product_id is 'Product';
comment on column price_history.store_id is 'Store';
comment on column price_history.price is 'Price';
comment on column price_history.price_type is 'Type of price (promo or regular)';
comment on column price_history.valid_from is 'Start date when price is valid';
comment on column price_history.valid_to is 'End date when price is valid';
comment on column price_history.source_offer_id is 'Source offer if price came from a promotion';

