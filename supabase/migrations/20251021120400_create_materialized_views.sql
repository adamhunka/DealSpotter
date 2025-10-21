-- =====================================================
-- Migration: Create Materialized Views
-- Description: Materialized view for parsing error statistics
-- Views: parsing_error_stats
-- Purpose: Monitor extraction error rates and ensure <5% threshold
-- Author: Database Schema from db-plan.md
-- Date: 2025-10-21
-- =====================================================

-- =====================================================
-- MATERIALIZED VIEW: parsing_error_stats
-- Description: Weekly statistics of parsing errors by store
-- Purpose: Monitor extraction quality and alert when error rate exceeds 5%
-- Refresh: Should be refreshed regularly via refresh_parsing_error_stats() function
-- =====================================================

create materialized view parsing_error_stats as
select 
    date_trunc('week', el.created_at) as week_start,
    f.store_id,
    s.name as store_name,
    count(*) as total_extractions,
    count(*) filter (where el.status = 'error') as error_count,
    round(
        (count(*) filter (where el.status = 'error')::decimal / nullif(count(*), 0) * 100), 
        2
    ) as error_rate_percentage,
    max(el.created_at) as last_extraction
from extraction_logs el
join flyers f on el.flyer_id = f.id
join stores s on f.store_id = s.id
where el.created_at >= now() - interval '8 weeks'
group by date_trunc('week', el.created_at), f.store_id, s.name;

comment on materialized view parsing_error_stats is 'Weekly parsing error statistics by store for last 8 weeks';
comment on column parsing_error_stats.week_start is 'Start of week (Monday)';
comment on column parsing_error_stats.store_id is 'Store UUID';
comment on column parsing_error_stats.store_name is 'Store name';
comment on column parsing_error_stats.total_extractions is 'Total number of extraction attempts';
comment on column parsing_error_stats.error_count is 'Number of failed extractions';
comment on column parsing_error_stats.error_rate_percentage is 'Percentage of failed extractions';
comment on column parsing_error_stats.last_extraction is 'Timestamp of most recent extraction';

-- =====================================================
-- INDEXES: parsing_error_stats
-- =====================================================

-- Unique index on week_start and store_id for concurrent refresh
create unique index idx_parsing_error_stats_unique on parsing_error_stats(week_start, store_id);

-- Index on error_rate_percentage for finding problematic stores
create index idx_parsing_error_stats_error_rate on parsing_error_stats(error_rate_percentage desc);

comment on index idx_parsing_error_stats_unique is 'Unique index required for CONCURRENTLY refresh of materialized view';
comment on index idx_parsing_error_stats_error_rate is 'Fast lookup of stores with highest error rates';

