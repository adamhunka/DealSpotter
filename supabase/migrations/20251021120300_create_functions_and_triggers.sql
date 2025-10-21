-- =====================================================
-- Migration: Create Functions and Triggers
-- Description: Functions for updated_at, audit logging, error monitoring, and log cleanup
-- Author: Database Schema from db-plan.md
-- Date: 2025-10-21
-- =====================================================

-- =====================================================
-- FUNCTION: update_updated_at_column
-- Description: Automatically updates the updated_at timestamp
-- Usage: Attached as BEFORE UPDATE trigger on tables
-- =====================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

comment on function update_updated_at_column is 'Automatically updates updated_at timestamp on row update';

-- =====================================================
-- TRIGGERS: updated_at for all applicable tables
-- =====================================================

-- Trigger for stores table
create trigger trigger_stores_updated_at 
before update on stores
for each row execute function update_updated_at_column();

-- Trigger for flyers table
create trigger trigger_flyers_updated_at 
before update on flyers
for each row execute function update_updated_at_column();

-- Trigger for categories table
create trigger trigger_categories_updated_at 
before update on categories
for each row execute function update_updated_at_column();

-- Trigger for products table
create trigger trigger_products_updated_at 
before update on products
for each row execute function update_updated_at_column();

-- Trigger for product_offers table
create trigger trigger_product_offers_updated_at 
before update on product_offers
for each row execute function update_updated_at_column();

comment on trigger trigger_stores_updated_at on stores is 'Auto-update updated_at timestamp';
comment on trigger trigger_flyers_updated_at on flyers is 'Auto-update updated_at timestamp';
comment on trigger trigger_categories_updated_at on categories is 'Auto-update updated_at timestamp';
comment on trigger trigger_products_updated_at on products is 'Auto-update updated_at timestamp';
comment on trigger trigger_product_offers_updated_at on product_offers is 'Auto-update updated_at timestamp';

-- =====================================================
-- FUNCTION: audit_product_offers
-- Description: Audit trail for product_offers table
-- Tracks: INSERT, UPDATE, DELETE operations
-- =====================================================

create or replace function audit_product_offers()
returns trigger as $$
begin
    -- Handle DELETE operation
    if (tg_op = 'DELETE') then
        insert into audit_logs (table_name, record_id, operation, old_values, changed_by)
        values ('product_offers', old.id, 'DELETE', row_to_json(old)::jsonb, auth.uid());
        return old;
    
    -- Handle UPDATE operation
    elsif (tg_op = 'UPDATE') then
        insert into audit_logs (table_name, record_id, operation, old_values, new_values, changed_by)
        values ('product_offers', new.id, 'UPDATE', row_to_json(old)::jsonb, row_to_json(new)::jsonb, auth.uid());
        return new;
    
    -- Handle INSERT operation
    elsif (tg_op = 'INSERT') then
        insert into audit_logs (table_name, record_id, operation, new_values, changed_by)
        values ('product_offers', new.id, 'INSERT', row_to_json(new)::jsonb, auth.uid());
        return new;
    end if;
end;
$$ language plpgsql security definer;

comment on function audit_product_offers is 'Audit logging for product_offers table (INSERT/UPDATE/DELETE)';

-- =====================================================
-- TRIGGER: audit_product_offers
-- =====================================================

create trigger trigger_audit_product_offers
after insert or update or delete on product_offers
for each row execute function audit_product_offers();

comment on trigger trigger_audit_product_offers on product_offers is 'Audit trail for all changes to product_offers';

-- =====================================================
-- FUNCTION: audit_flyers
-- Description: Audit trail for flyers table
-- Tracks: INSERT, UPDATE, DELETE operations
-- =====================================================

create or replace function audit_flyers()
returns trigger as $$
begin
    -- Handle DELETE operation
    if (tg_op = 'DELETE') then
        insert into audit_logs (table_name, record_id, operation, old_values, changed_by)
        values ('flyers', old.id, 'DELETE', row_to_json(old)::jsonb, auth.uid());
        return old;
    
    -- Handle UPDATE operation
    elsif (tg_op = 'UPDATE') then
        insert into audit_logs (table_name, record_id, operation, old_values, new_values, changed_by)
        values ('flyers', new.id, 'UPDATE', row_to_json(old)::jsonb, row_to_json(new)::jsonb, auth.uid());
        return new;
    
    -- Handle INSERT operation
    elsif (tg_op = 'INSERT') then
        insert into audit_logs (table_name, record_id, operation, new_values, changed_by)
        values ('flyers', new.id, 'INSERT', row_to_json(new)::jsonb, auth.uid());
        return new;
    end if;
end;
$$ language plpgsql security definer;

comment on function audit_flyers is 'Audit logging for flyers table (INSERT/UPDATE/DELETE)';

-- =====================================================
-- TRIGGER: audit_flyers
-- =====================================================

create trigger trigger_audit_flyers
after insert or update or delete on flyers
for each row execute function audit_flyers();

comment on trigger trigger_audit_flyers on flyers is 'Audit trail for all changes to flyers';

-- =====================================================
-- FUNCTION: cleanup_old_logs
-- Description: Removes logs older than 90 days
-- Retention: extraction_logs and llm_logs only
-- Schedule: Should be run daily via pg_cron or external scheduler
-- =====================================================

create or replace function cleanup_old_logs()
returns void as $$
begin
    -- Delete extraction_logs older than 90 days
    delete from extraction_logs where created_at < now() - interval '90 days';
    
    -- Delete llm_logs older than 90 days
    delete from llm_logs where created_at < now() - interval '90 days';
    
    -- Note: audit_logs are not automatically cleaned up
    -- Consider implementing separate retention policy for audit_logs if needed
    -- delete from audit_logs where changed_at < now() - interval '365 days';
end;
$$ language plpgsql;

comment on function cleanup_old_logs is 'Removes extraction_logs and llm_logs older than 90 days (should be scheduled daily)';

-- =====================================================
-- FUNCTION: check_parsing_error_threshold
-- Description: Checks if parsing error rate exceeds 5% threshold
-- Alert mechanism: Uses pg_notify for real-time alerts
-- Usage: Should be called after refreshing parsing_error_stats materialized view
-- =====================================================

create or replace function check_parsing_error_threshold()
returns void as $$
declare
    v_record record;
    v_threshold decimal := 5.0;
begin
    -- Loop through stores with error rate above threshold in current week
    for v_record in 
        select 
            week_start,
            store_name,
            error_rate_percentage,
            total_extractions,
            error_count
        from parsing_error_stats
        where error_rate_percentage > v_threshold
        and week_start >= date_trunc('week', now())
    loop
        -- Log warning
        raise warning 'ALERT: Parsing error rate exceeded threshold for % in week %: %.2f%% (% errors / % total)',
            v_record.store_name,
            v_record.week_start,
            v_record.error_rate_percentage,
            v_record.error_count,
            v_record.total_extractions;
        
        -- Send notification via pg_notify for application listeners
        perform pg_notify('parsing_error_alert', 
            json_build_object(
                'store', v_record.store_name,
                'week', v_record.week_start,
                'error_rate', v_record.error_rate_percentage,
                'total', v_record.total_extractions,
                'errors', v_record.error_count
            )::text
        );
    end loop;
end;
$$ language plpgsql;

comment on function check_parsing_error_threshold is 'Monitors parsing error rate and sends alerts when exceeding 5% threshold';

-- =====================================================
-- FUNCTION: refresh_parsing_error_stats
-- Description: Refreshes the parsing_error_stats materialized view
-- Usage: Should be scheduled to run periodically (e.g., hourly or daily)
-- =====================================================

create or replace function refresh_parsing_error_stats()
returns void as $$
begin
    refresh materialized view concurrently parsing_error_stats;
end;
$$ language plpgsql;

comment on function refresh_parsing_error_stats is 'Refreshes parsing_error_stats materialized view (should be scheduled)';

