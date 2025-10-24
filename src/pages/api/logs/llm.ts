// src/pages/api/logs/llm.ts

import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { llmLogsQuerySchema } from "../../../lib/schemas/log.schema";
import { LogService } from "../../../lib/services/logService";
import { errorResponse, jsonResponse } from "../../../lib/api.utils";
import { verifyAdminRole } from "../../../lib/auth.utils";

export const prerender = false;

/**
 * GET /api/logs/llm
 *
 * Admin-only endpoint that retrieves paginated LLM logs with optional filters
 *
 * Query Parameters:
 * - page (required): Page number, minimum 1
 * - limit (required): Items per page, range 1-100
 * - model (optional): Filter by LLM model name
 * - status (optional): Filter by LLM request status (success, error, timeout)
 *
 * Responses:
 * - 200: Success with paginated LLM logs
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
      model: url.searchParams.get("model") || undefined,
      status: url.searchParams.get("status") || undefined,
    };

    // Validate query parameters using Zod schema
    const validatedParams = llmLogsQuerySchema.parse(queryParams);

    // Initialize service with Supabase client from locals
    const logService = new LogService(locals.supabase);

    // Fetch LLM logs from database
    const response = await logService.getLLMLogs(validatedParams);

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
    console.error("Error in GET /api/logs/llm:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(`Internal server error: ${message}`, 500);
  }
};
