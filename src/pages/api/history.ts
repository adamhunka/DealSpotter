// src/pages/api/history.ts

import type { APIRoute } from "astro";
import { historyQuerySchema } from "../../lib/schemas/history.schema";
import { PriceHistoryService } from "../../lib/services/priceHistoryService";
import { errorResponse, jsonResponse } from "../../lib/api.utils";
import { ZodError } from "zod";

export const prerender = false;

/**
 * GET /api/history
 *
 * Retrieves paginated price history with optional filters
 *
 * Query Parameters:
 * - page (required): Page number, minimum 1
 * - limit (required): Items per page, range 1-100
 * - productId (optional): Filter by product UUID
 * - storeId (optional): Filter by store UUID
 *
 * Responses:
 * - 200: Success with paginated price history
 * - 400: Invalid query parameters
 * - 401: Unauthorized (if authentication is required)
 * - 500: Server error
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Parse query parameters from URL
    const url = new URL(request.url);
    const queryParams = {
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
      productId: url.searchParams.get("productId") || undefined,
      storeId: url.searchParams.get("storeId") || undefined,
    };

    // Validate query parameters using Zod schema
    const validatedParams = historyQuerySchema.parse(queryParams);

    // Initialize service with Supabase client from locals
    const priceHistoryService = new PriceHistoryService(locals.supabase);

    // Fetch price history from database
    const response = await priceHistoryService.getHistory({
      productId: validatedParams.productId,
      storeId: validatedParams.storeId,
      page: validatedParams.page,
      limit: validatedParams.limit,
    });

    // Return successful response
    return jsonResponse(response);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const details = error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return jsonResponse(
        {
          error: "Invalid query parameters",
          details,
        },
        400
      );
    }

    // Handle general errors
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(`Internal server error: ${message}`, 500);
  }
};
