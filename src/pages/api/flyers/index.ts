import type { APIRoute } from "astro";
import { ZodError } from "astro/zod";
import { FlyerService } from "../../../lib/services/flyer.service";
import { errorResponse, jsonResponse } from "../../../lib/api.utils";
import { listFlyersQuerySchema, fetchFlyersCommandSchema } from "../../../lib/schemas/flyer.schema";
import type { JobResponseDTO } from "../../../types";

export const prerender = false;

/**
 * GET /api/flyers
 * List flyers with optional filtering and pagination
 *
 * Query parameters:
 * - storeId (UUID): Filter by store
 * - valid (boolean): Only currently valid flyers
 * - page (number, >=1): Page number (default: 1)
 * - limit (number, 1-100): Items per page (default: 20)
 *
 * Returns: PaginatedResponse<FlyerDTO>
 */
export const GET: APIRoute = async ({ locals, url }) => {
  try {
    // Extract and validate query parameters
    const queryParams = {
      storeId: url.searchParams.get("storeId") ?? undefined,
      valid: url.searchParams.get("valid") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    };

    const validatedParams = listFlyersQuerySchema.parse(queryParams);

    // Build filter object
    const filter = {
      storeId: validatedParams.storeId,
      valid: validatedParams.valid,
    };

    // Call service
    const flyerService = new FlyerService(locals.supabase);
    const result = await flyerService.listFlyers(filter, validatedParams.page, validatedParams.limit);

    return jsonResponse(result);
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return errorResponse("Invalid query parameters", 400);
    }

    // Handle other errors
    console.error("Error in GET /api/flyers:", error);
    return errorResponse("Internal server error", 500);
  }
};

/**
 * POST /api/flyers/fetch
 * Trigger background job to fetch latest flyer PDFs from all stores
 * Admin-only endpoint
 *
 * Body: {} (empty object)
 *
 * Returns: JobResponseDTO { jobId: string }
 */
export const POST: APIRoute = async ({ locals, request }) => {
  try {
    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await locals.supabase.auth.getSession();

    if (sessionError || !session) {
      return errorResponse("Unauthorized", 401);
    }

    // Check if user has admin role
    const userRole = session.user.user_metadata?.role;
    if (userRole !== "admin") {
      return errorResponse("Forbidden: Admin access required", 403);
    }

    // Validate request body
    const body = await request.json();
    fetchFlyersCommandSchema.parse(body);

    // Trigger the fetch job
    const flyerService = new FlyerService(locals.supabase);
    const jobId = await flyerService.triggerFetchFlyers();

    const response: JobResponseDTO = { jobId };
    return jsonResponse(response, 202); // 202 Accepted for async operation
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return errorResponse("Invalid JSON in request body", 400);
    }

    // Handle validation errors
    if (error instanceof ZodError) {
      return errorResponse("Invalid request body", 400);
    }

    // Handle other errors
    console.error("Error in POST /api/flyers/fetch:", error);
    return errorResponse("Internal server error", 500);
  }
};
