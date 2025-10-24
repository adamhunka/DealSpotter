// src/lib/services/logService.ts

import type { SupabaseClient } from "../../db/supabase.client";
import type {
  ExtractionLogDTO,
  LLMLogDTO,
  PaginatedResponse,
  ExtractionLog,
  LLMLog,
  ExtractionLogsQueryCommand,
  LLMLogsQueryCommand,
} from "../../types";

/**
 * Service for managing log operations (extraction logs and LLM logs)
 */
export class LogService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Retrieves paginated extraction logs with optional filters
   *
   * @param params - Query parameters including pagination and optional filters (flyerId, status)
   * @returns Paginated response containing extraction log items and metadata
   * @throws Error if database query fails
   */
  async getExtractionLogs(params: ExtractionLogsQueryCommand): Promise<PaginatedResponse<ExtractionLogDTO>> {
    const { page, limit, flyerId, status } = params;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build base query with count for pagination metadata
    let query = this.supabase.from("extraction_logs").select("*", { count: "exact" });

    // Apply optional filters
    if (flyerId) {
      query = query.eq("flyer_id", flyerId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Apply sorting (most recent first) and pagination
    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    // Handle database errors
    if (error) {
      throw new Error(`Failed to fetch extraction logs: ${error.message}`);
    }

    // Map database rows to DTOs
    const items: ExtractionLogDTO[] = (data || []).map((row: ExtractionLog) => ({
      id: row.id,
      flyerId: row.flyer_id,
      productOfferId: row.product_offer_id,
      extractionType: row.extraction_type,
      status: row.status,
      errorMessage: row.error_message,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));

    // Build paginated response
    return {
      items,
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    };
  }

  /**
   * Retrieves paginated LLM logs with optional filters
   *
   * @param params - Query parameters including pagination and optional filters (model, status)
   * @returns Paginated response containing LLM log items and metadata
   * @throws Error if database query fails
   */
  async getLLMLogs(params: LLMLogsQueryCommand): Promise<PaginatedResponse<LLMLogDTO>> {
    const { page, limit, model, status } = params;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build base query with count for pagination metadata
    let query = this.supabase.from("llm_logs").select("*", { count: "exact" });

    // Apply optional filters
    if (model) {
      query = query.eq("model", model);
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Apply sorting (most recent first) and pagination
    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    // Handle database errors
    if (error) {
      throw new Error(`Failed to fetch LLM logs: ${error.message}`);
    }

    // Map database rows to DTOs
    const items: LLMLogDTO[] = (data || []).map((row: LLMLog) => ({
      id: row.id,
      flyerId: row.flyer_id,
      productOfferId: row.product_offer_id,
      model: row.model,
      request: row.request,
      response: row.response,
      status: row.status,
      errorMessage: row.error_message,
      costUsd: row.cost_usd,
      durationMs: row.duration_ms,
      tokensInput: row.tokens_input,
      tokensOutput: row.tokens_output,
      createdAt: row.created_at,
    }));

    // Build paginated response
    return {
      items,
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    };
  }
}
