# DealSpotter Database Migrations

This directory contains Supabase database migrations for the DealSpotter MVP project.

## Migration Order

The migrations are numbered sequentially and should be applied in order:

1. **20251021120000_create_base_tables.sql**
   - Creates core tables: stores, flyers, categories, products, product_offers, price_history
   - Enables PostgreSQL extensions (pgcrypto, unaccent)
   - Sets up all constraints and checks
   - Enables RLS on all tables

2. **20251021120100_create_logging_tables.sql**
   - Creates logging tables: extraction_logs, llm_logs, audit_logs
   - Sets up tables for monitoring extraction processes and LLM usage
   - Configures audit logging infrastructure

3. **20251021120200_create_indexes.sql**
   - Creates B-tree indexes for common queries
   - Creates GIN indexes for JSONB and full-text search
   - Creates partial indexes for optimized filtering
   - Adds comprehensive performance indexes

4. **20251021120300_create_functions_and_triggers.sql**
   - Creates function for automatic updated_at timestamps
   - Creates audit logging functions for flyers and product_offers
   - Creates cleanup function for 90-day log retention
   - Creates error monitoring function for parsing threshold alerts
   - Sets up all triggers

5. **20251021120400_create_materialized_views.sql**
   - Creates parsing_error_stats materialized view
   - Monitors extraction error rates by week and store
   - Supports 5% error threshold monitoring

6. **20251021120500_create_rls_policies.sql**
   - Creates RLS policies for all tables
   - Public read access to operational data (stores, products, offers)
   - Admin-only access to logs and sensitive data
   - Separate policies for anon and authenticated roles

7. **20251021120600_seed_data.sql**
   - Seeds initial stores (Biedronka, Lidl)
   - Seeds product categories
   - Uses fixed UUIDs for stores for easy reference

## Running Migrations

Migrations are automatically applied when running:

```bash
supabase db reset
```

Or to apply only new migrations:

```bash
supabase db push
```

## Development Workflow

### Creating a New Migration

```bash
supabase migration new your_migration_name
```

### Resetting Local Database

```bash
supabase db reset
```

### Applying Migrations to Remote

```bash
supabase db push
```

## Database Schema

See `/.ai/db-plan.md` for complete database schema documentation.

## Key Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Public data is readable by all authenticated users
- Admin-only access to logs and audit trails
- Service role bypasses RLS for backend operations

### Audit Logging
- Automatic audit logging for `flyers` and `product_offers` tables
- Tracks INSERT, UPDATE, DELETE operations
- Stores old and new values as JSONB
- Captures user ID from Supabase Auth

### Log Retention
- `extraction_logs` and `llm_logs` have 90-day retention
- Automatic cleanup via `cleanup_old_logs()` function
- Should be scheduled daily via pg_cron or external scheduler

### Error Monitoring
- `parsing_error_stats` materialized view tracks error rates
- `check_parsing_error_threshold()` function alerts when error rate exceeds 5%
- Uses pg_notify for real-time alerts

### Full-Text Search
- Products have full-text search vector using simple configuration (language-agnostic)
- Generated column with GIN index for performance
- Searches across name, brand, and description fields
- Note: Using 'simple' config for maximum compatibility; can be upgraded to language-specific config later

## Admin User Setup

To grant admin access to a user, update their metadata in Supabase Auth:

```sql
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
where email = 'admin@example.com';
```

## Service Role Usage

Backend services should use the `service_role` key for operations that need to bypass RLS:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

## Scheduled Tasks

The following functions should be scheduled:

1. **cleanup_old_logs()** - Daily at 2:00 AM
   - Removes logs older than 90 days
   
2. **refresh_parsing_error_stats()** - Hourly or daily
   - Refreshes materialized view
   
3. **check_parsing_error_threshold()** - After refreshing stats
   - Sends alerts if error rate exceeds 5%

### Example with pg_cron

```sql
-- Requires pg_cron extension (superuser privileges)
select cron.schedule('cleanup-logs', '0 2 * * *', 'select cleanup_old_logs()');
select cron.schedule('refresh-stats', '0 * * * *', 'select refresh_parsing_error_stats()');
```

## Troubleshooting

### Migration Fails

If a migration fails:

1. Check error message in terminal
2. Fix the migration file
3. Reset database: `supabase db reset`

### RLS Issues

If queries are being blocked unexpectedly:

1. Check user role in `auth.users.raw_user_meta_data`
2. Verify RLS policies with `\d+ table_name` in psql
3. Use service_role key for backend operations

### Performance Issues

If queries are slow:

1. Check index usage with `EXPLAIN ANALYZE`
2. Review indexes in migration 20251021120200
3. Consider adding BRIN indexes for large tables (>1M rows)

## Notes

- All SQL is written in lowercase for consistency
- Comments are extensive for production-ready code
- Each migration is idempotent where possible (using ON CONFLICT)
- Migrations follow Supabase best practices

