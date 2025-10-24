// src/lib/services/priceHistoryService.ts

import type { SupabaseClient } from "../../db/supabase.client";
import type { PriceHistoryDTO, PaginatedResponse, PriceHistory } from "../../types";

interface GetHistoryParams {
  productId?: string;
  storeId?: string;
  page: number;
  limit: number;
}

/**
 * Service for managing price history operations
 */
export class PriceHistoryService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Retrieves paginated price history with optional filters
   *
   * @param params - Query parameters including pagination and optional filters
   * @returns Paginated response containing price history items and metadata
   * @throws Error if database query fails
   */
  async getHistory(params: GetHistoryParams): Promise<PaginatedResponse<PriceHistoryDTO>> {
    const { productId, storeId, page, limit } = params;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build base query
    let query = this.supabase.from("price_history").select("*", { count: "exact" });

    // Apply optional filters
    if (productId) {
      query = query.eq("product_id", productId);
    }

    if (storeId) {
      query = query.eq("store_id", storeId);
    }

    // Apply sorting and pagination
    query = query.order("valid_from", { ascending: false }).range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    // Handle database errors
    if (error) {
      throw new Error(`Failed to fetch price history: ${error.message}`);
    }

    // Map database rows to DTOs
    const items: PriceHistoryDTO[] = (data || []).map((row: PriceHistory) => ({
      id: row.id,
      price: row.price,
      priceType: row.price_type,
      productId: row.product_id,
      sourceOfferId: row.source_offer_id,
      storeId: row.store_id,
      validFrom: row.valid_from,
      validTo: row.valid_to,
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
