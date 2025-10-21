-- =====================================================
-- Migration: Seed Initial Data
-- Description: Initial data for stores and categories
-- Tables: stores, categories
-- Note: Uses fixed UUIDs for stores for reference in application code
-- Author: Database Schema from db-plan.md
-- Date: 2025-10-21
-- =====================================================

-- =====================================================
-- SEED DATA: stores
-- Description: Initial grocery discount stores
-- Note: Using fixed UUIDs for easy reference in application code
-- =====================================================

insert into stores (id, name, slug, logo_url) values
    ('550e8400-e29b-41d4-a716-446655440001', 'Biedronka', 'biedronka', null),
    ('550e8400-e29b-41d4-a716-446655440002', 'Lidl', 'lidl', null)
on conflict (id) do nothing;

comment on column stores.id is 'Store UUID (Biedronka: 550e8400-e29b-41d4-a716-446655440001, Lidl: 550e8400-e29b-41d4-a716-446655440002)';

-- =====================================================
-- SEED DATA: categories
-- Description: Initial product categories
-- Note: Flat structure without hierarchy for MVP
-- =====================================================

insert into categories (name, slug, icon) values
    ('Owoce i warzywa', 'owoce-warzywa', null),
    ('Mięso i wędliny', 'mieso-wedliny', null),
    ('Nabiał', 'nabial', null),
    ('Pieczywo', 'pieczywo', null),
    ('Napoje', 'napoje', null),
    ('Słodycze i przekąski', 'slodycze-przekaski', null),
    ('Chemia domowa', 'chemia-domowa', null),
    ('Kosmetyki', 'kosmetyki', null),
    ('Artykuły przemysłowe', 'artykuly-przemyslowe', null),
    ('Inne', 'inne', null)
on conflict (slug) do nothing;

