-- =====================================================
-- Migration: Create Logging Tables
-- Description: Tables for extraction logs, LLM logs, and audit logs
-- Tables: extraction_logs, llm_logs, audit_logs
-- Retention: extraction_logs and llm_logs have 90-day retention
-- Author: Database Schema from db-plan.md
-- Date: 2025-10-21
-- =====================================================

-- =====================================================
-- TABLE: extraction_logs
-- Description: Logs for data extraction processes from flyers
-- Retention: 90 days (automatic cleanup via scheduled function)
-- =====================================================

create table extraction_logs (
    id uuid primary key default gen_random_uuid(),
    flyer_id uuid not null references flyers(id) on delete cascade,
    product_offer_id uuid references product_offers(id) on delete set null,
    extraction_type varchar(50) not null,
    status varchar(50) not null,
    error_message text,
    metadata jsonb,
    created_at timestamptz not null default now(),
    
    -- Constraints
    constraint check_extraction_type check(extraction_type in ('full_pdf', 'page', 'product')),
    constraint check_status check(status in ('success', 'error', 'partial'))
);

-- Enable RLS for extraction_logs table
alter table extraction_logs enable row level security;

comment on table extraction_logs is 'Logs of extraction processes from flyers (90-day retention)';
comment on column extraction_logs.flyer_id is 'Flyer being processed';
comment on column extraction_logs.product_offer_id is 'Product offer if extraction is for specific product';
comment on column extraction_logs.extraction_type is 'Type of extraction (full_pdf, page, product)';
comment on column extraction_logs.status is 'Extraction status (success, error, partial)';
comment on column extraction_logs.error_message is 'Error message if extraction failed';
comment on column extraction_logs.metadata is 'Additional metadata (e.g., duration, model used)';

-- =====================================================
-- TABLE: llm_logs
-- Description: Logs for communication with LLM models via OpenRouter
-- Retention: 90 days (automatic cleanup via scheduled function)
-- =====================================================

create table llm_logs (
    id uuid primary key default gen_random_uuid(),
    flyer_id uuid references flyers(id) on delete set null,
    product_offer_id uuid references product_offers(id) on delete set null,
    model varchar(100) not null,
    request jsonb not null,
    response jsonb not null,
    tokens_input integer,
    tokens_output integer,
    cost_usd decimal(10,6),
    duration_ms integer,
    status varchar(50) not null,
    error_message text,
    created_at timestamptz not null default now(),
    
    -- Constraints
    constraint check_status check(status in ('success', 'error', 'timeout')),
    constraint check_tokens_input check(tokens_input is null or tokens_input >= 0),
    constraint check_tokens_output check(tokens_output is null or tokens_output >= 0),
    constraint check_cost_usd check(cost_usd is null or cost_usd >= 0),
    constraint check_duration_ms check(duration_ms is null or duration_ms >= 0)
);

-- Enable RLS for llm_logs table
alter table llm_logs enable row level security;

comment on table llm_logs is 'Logs of LLM communication via OpenRouter (90-day retention)';
comment on column llm_logs.flyer_id is 'Flyer if LLM call is related to flyer processing';
comment on column llm_logs.product_offer_id is 'Product offer if LLM call is related to offer extraction';
comment on column llm_logs.model is 'LLM model name (e.g., "gpt-4o", "claude-3-opus")';
comment on column llm_logs.request is 'Request sent to LLM';
comment on column llm_logs.response is 'Response from LLM';
comment on column llm_logs.tokens_input is 'Number of input tokens';
comment on column llm_logs.tokens_output is 'Number of output tokens';
comment on column llm_logs.cost_usd is 'Cost of request in USD';
comment on column llm_logs.duration_ms is 'Duration of request in milliseconds';
comment on column llm_logs.status is 'Status (success, error, timeout)';
comment on column llm_logs.error_message is 'Error message if request failed';

-- =====================================================
-- TABLE: audit_logs
-- Description: Audit logs for changes in critical tables
-- Retention: No automatic cleanup (consider archiving after 1+ years)
-- =====================================================

create table audit_logs (
    id uuid primary key default gen_random_uuid(),
    table_name varchar(100) not null,
    record_id uuid not null,
    operation varchar(20) not null,
    old_values jsonb,
    new_values jsonb,
    changed_by uuid,
    changed_at timestamptz not null default now(),
    metadata jsonb,
    
    -- Constraints
    constraint check_operation check(operation in ('INSERT', 'UPDATE', 'DELETE'))
);

-- Enable RLS for audit_logs table
alter table audit_logs enable row level security;

comment on table audit_logs is 'Audit logs for tracking changes in critical tables';
comment on column audit_logs.table_name is 'Name of table that was modified';
comment on column audit_logs.record_id is 'ID of modified record';
comment on column audit_logs.operation is 'Operation performed (INSERT, UPDATE, DELETE)';
comment on column audit_logs.old_values is 'Old values (for UPDATE/DELETE)';
comment on column audit_logs.new_values is 'New values (for INSERT/UPDATE)';
comment on column audit_logs.changed_by is 'User ID from auth.users who made the change';
comment on column audit_logs.changed_at is 'Timestamp of change';
comment on column audit_logs.metadata is 'Additional metadata';

