// src/lib/services/stats.service.ts

import type { SupabaseClient } from "../../db/supabase.client";
import type { ParsingErrorStatDTO, ParsingErrorStat } from "../../types";

/**
 * Service for managing statistics operations
 */
export class StatsService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Retrieves weekly parsing error statistics from materialized view
   *
   * @returns Array of parsing error statistics per store and week
   * @throws Error if database query fails
   */
  async getParsingErrorStats(): Promise<ParsingErrorStatDTO[]> {
    // Query the materialized view for parsing error statistics
    const { data, error } = await this.supabase
      .from("parsing_error_stats")
      .select("week_start, store_id, error_rate_percentage, total_extractions")
      .order("week_start", { ascending: false })
      .order("store_id", { ascending: true });

    // Handle database errors
    if (error) {
      throw new Error(`Failed to fetch parsing error stats: ${error.message}`);
    }

    // Map database rows to DTOs
    const stats: ParsingErrorStatDTO[] = (data || []).map((row: ParsingErrorStat) => ({
      weekStart: row.week_start,
      storeId: row.store_id,
      errorRate: row.error_rate_percentage,
      total: row.total_extractions,
    }));

    return stats;
  }
}
