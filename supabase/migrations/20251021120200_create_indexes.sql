-- =====================================================
-- Migration: Create Performance Indexes
-- Description: B-tree and GIN indexes for optimal query performance
-- Tables: stores, flyers, categories, products, product_offers, price_history, extraction_logs, llm_logs, audit_logs
-- Author: Database Schema from db-plan.md
-- Date: 2025-10-21
-- =====================================================

-- =====================================================
-- INDEXES: stores
-- =====================================================

-- Index on slug for URL lookups
create index idx_stores_slug on stores(slug);

comment on index idx_stores_slug is 'Fast lookup by store slug for URL routing';

-- =====================================================
-- INDEXES: flyers
-- =====================================================

-- Index on store_id for filtering by store
create index idx_flyers_store_id on flyers(store_id);

-- Index on valid dates for finding active promotions
create index idx_flyers_valid_dates on flyers(valid_from, valid_to);

-- Partial index on extraction_status for pending/in-progress/failed flyers
create index idx_flyers_extraction_status on flyers(extraction_status) where extraction_status != 'completed';

-- Index on issue_date for sorting by newest flyers
create index idx_flyers_issue_date on flyers(issue_date desc);

comment on index idx_flyers_store_id is 'Filter flyers by store';
comment on index idx_flyers_valid_dates is 'Find flyers with active promotions';
comment on index idx_flyers_extraction_status is 'Partial index for incomplete extractions only';
comment on index idx_flyers_issue_date is 'Sort flyers by issue date descending';

-- =====================================================
-- INDEXES: categories
-- =====================================================

-- Index on slug for URL lookups
create index idx_categories_slug on categories(slug);

comment on index idx_categories_slug is 'Fast lookup by category slug for URL routing';

-- =====================================================
-- INDEXES: products
-- =====================================================

-- Index on category_id for filtering by category
create index idx_products_category_id on products(category_id);

-- Index on normalized_name for product matching
create index idx_products_normalized_name on products(normalized_name);

-- Partial index on brand (only for products with brands)
create index idx_products_brand on products(brand) where brand is not null;

-- GIN index on search_vector for full-text search
create index idx_products_search_vector on products using gin(search_vector);

comment on index idx_products_category_id is 'Filter products by category';
comment on index idx_products_normalized_name is 'Fast lookup by normalized product name';
comment on index idx_products_brand is 'Partial index for brand filtering (only non-null brands)';
comment on index idx_products_search_vector is 'Full-text search index using simple configuration (language-agnostic)';

-- =====================================================
-- INDEXES: product_offers
-- =====================================================

-- Index on flyer_id for filtering offers by flyer
create index idx_product_offers_flyer_id on product_offers(flyer_id);

-- Index on product_id for finding all offers for a product
create index idx_product_offers_product_id on product_offers(product_id);

-- Index on promo_price descending for sorting by price
create index idx_product_offers_promo_price_desc on product_offers(promo_price desc);

-- Index on valid dates for finding active offers
create index idx_product_offers_valid_dates on product_offers(valid_from, valid_to);

-- GIN index on conditions for flexible JSONB queries
create index idx_product_offers_conditions on product_offers using gin(conditions);

-- Partial index on discount_percentage for best deals (only non-null discounts)
create index idx_product_offers_discount on product_offers(discount_percentage desc nulls last) where discount_percentage is not null;

-- Partial index on extraction_confidence for unverified offers
create index idx_product_offers_unverified on product_offers(extraction_confidence) where manually_verified = false;

comment on index idx_product_offers_flyer_id is 'Filter offers by flyer';
comment on index idx_product_offers_product_id is 'Find all offers for a specific product';
comment on index idx_product_offers_promo_price_desc is 'Sort offers by promotional price';
comment on index idx_product_offers_valid_dates is 'Find currently active offers';
comment on index idx_product_offers_conditions is 'Flexible JSONB queries on promotion conditions';
comment on index idx_product_offers_discount is 'Partial index for highest discount offers (nulls excluded)';
comment on index idx_product_offers_unverified is 'Partial index for unverified offers needing review';

-- =====================================================
-- INDEXES: price_history
-- =====================================================

-- Index on product_id for price history by product
create index idx_price_history_product_id on price_history(product_id);

-- Index on store_id for price history by store
create index idx_price_history_store_id on price_history(store_id);

-- Index on valid_from for sorting by date
create index idx_price_history_valid_from on price_history(valid_from desc);

-- Composite index for efficient price history queries
create index idx_price_history_composite on price_history(product_id, store_id, valid_from desc);

comment on index idx_price_history_product_id is 'Filter price history by product';
comment on index idx_price_history_store_id is 'Filter price history by store';
comment on index idx_price_history_valid_from is 'Sort price history by date';
comment on index idx_price_history_composite is 'Composite index for efficient price history queries by product and store';

-- =====================================================
-- INDEXES: extraction_logs
-- =====================================================

-- Index on flyer_id for filtering logs by flyer
create index idx_extraction_logs_flyer_id on extraction_logs(flyer_id);

-- Index on created_at for sorting logs by date
create index idx_extraction_logs_created_at on extraction_logs(created_at desc);

-- Partial index on status for error logs only
create index idx_extraction_logs_status on extraction_logs(status) where status = 'error';

comment on index idx_extraction_logs_flyer_id is 'Filter extraction logs by flyer';
comment on index idx_extraction_logs_created_at is 'Sort logs by creation date descending';
comment on index idx_extraction_logs_status is 'Partial index for error logs only';

-- =====================================================
-- INDEXES: llm_logs
-- =====================================================

-- Index on flyer_id for filtering logs by flyer
create index idx_llm_logs_flyer_id on llm_logs(flyer_id);

-- Index on created_at for sorting logs by date
create index idx_llm_logs_created_at on llm_logs(created_at desc);

-- Partial index on status for error logs only
create index idx_llm_logs_status on llm_logs(status) where status = 'error';

-- Index on model for filtering by LLM model
create index idx_llm_logs_model on llm_logs(model);

comment on index idx_llm_logs_flyer_id is 'Filter LLM logs by flyer';
comment on index idx_llm_logs_created_at is 'Sort logs by creation date descending';
comment on index idx_llm_logs_status is 'Partial index for error logs only';
comment on index idx_llm_logs_model is 'Filter logs by LLM model name';

-- =====================================================
-- INDEXES: audit_logs
-- =====================================================

-- Composite index on table_name and record_id for finding audit trail
create index idx_audit_logs_table_record on audit_logs(table_name, record_id);

-- Index on changed_at for sorting by date
create index idx_audit_logs_changed_at on audit_logs(changed_at desc);

-- Partial index on changed_by for user-initiated changes only
create index idx_audit_logs_changed_by on audit_logs(changed_by) where changed_by is not null;

comment on index idx_audit_logs_table_record is 'Find audit trail for specific record';
comment on index idx_audit_logs_changed_at is 'Sort audit logs by change date descending';
comment on index idx_audit_logs_changed_by is 'Partial index for user-initiated changes (nulls excluded)';

