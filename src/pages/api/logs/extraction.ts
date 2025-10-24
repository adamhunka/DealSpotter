// src/pages/api/logs/extraction.ts

import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { extractionLogsQuerySchema } from "../../../lib/schemas/log.schema";
import { LogService } from "../../../lib/services/logService";
import { errorResponse, jsonResponse } from "../../../lib/api.utils";
import { verifyAdminRole } from "../../../lib/auth.utils";

export const prerender = false;

/**
 * GET /api/logs/extraction
 *
 * Admin-only endpoint that retrieves paginated extraction logs with optional filters
 *
 * Query Parameters:
 * - page (required): Page number, minimum 1
 * - limit (required): Items per page, range 1-100
 * - flyerId (optional): Filter by flyer UUID
 * - status (optional): Filter by extraction status (success, error, partial)
 *
 * Responses:
 * - 200: Success with paginated extraction logs
 * - 400: Invalid query parameters
 * - 401: Unauthorized (not logged in)
 * - 403: Forbidden (not admin role)
 * - 500: Server error
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Verify admin role
    const authCheck = await verifyAdminRole(locals.supabase);
    if (!authCheck.isAuthorized) {
      return errorResponse(authCheck.error!.message, authCheck.error!.status);
    }

    // Parse query parameters from URL
    const url = new URL(request.url);
    const queryParams = {
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
      flyerId: url.searchParams.get("flyerId") || undefined,
      status: url.searchParams.get("status") || undefined,
    };

    // Validate query parameters using Zod schema
    const validatedParams = extractionLogsQuerySchema.parse(queryParams);

    // Initialize service with Supabase client from locals
    const logService = new LogService(locals.supabase);

    // Fetch extraction logs from database
    const response = await logService.getExtractionLogs(validatedParams);

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
    // eslint-disable-next-line no-console
    console.error("Error in GET /api/logs/extraction:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(`Internal server error: ${message}`, 500);
  }
};
