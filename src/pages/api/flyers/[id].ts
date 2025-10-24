import type { APIRoute } from "astro";
import { ZodError } from "astro/zod";
import { FlyerService } from "../../../lib/services/flyer.service";
import { errorResponse, jsonResponse } from "../../../lib/api.utils";
import { flyerIdParamSchema, extractFlyerCommandSchema } from "../../../lib/schemas/flyer.schema";
import type { JobResponseDTO } from "../../../types";

export const prerender = false;

/**
 * GET /api/flyers/:id
 * Get details of a single flyer by ID
 *
 * Path parameters:
 * - id (UUID): Flyer identifier
 *
 * Returns: FlyerDTO
 * Status codes:
 * - 200: Success
 * - 400: Invalid UUID format
 * - 404: Flyer not found
 * - 500: Internal server error
 */
export const GET: APIRoute = async ({ locals, params }) => {
  try {
    // Validate path parameter
    const validatedParams = flyerIdParamSchema.parse(params);

    // Call service to get flyer
    const flyerService = new FlyerService(locals.supabase);
    const flyer = await flyerService.getFlyerById(validatedParams.id);

    // Handle not found case
    if (!flyer) {
      return errorResponse("Flyer not found", 404);
    }

    return jsonResponse(flyer);
  } catch (error) {
    // Handle validation errors (invalid UUID)
    if (error instanceof ZodError) {
      return errorResponse("Invalid flyer ID format", 400);
    }

    // Handle other errors
    // eslint-disable-next-line no-console
    console.error("Error in GET /api/flyers/:id:", error);
    return errorResponse("Internal server error", 500);
  }
};

/**
 * POST /api/flyers/:id/extract
 * Trigger extraction of content from a specific flyer PDF
 * Admin-only endpoint
 *
 * Path parameters:
 * - id (UUID): Flyer identifier
 *
 * Body: ExtractFlyerCommand { flyerId: string }
 *
 * Returns: JobResponseDTO { jobId: string }
 * Status codes:
 * - 202: Job accepted
 * - 400: Invalid request (UUID format or body validation)
 * - 401: Unauthorized (not logged in)
 * - 403: Forbidden (not admin)
 * - 404: Flyer not found
 * - 500: Internal server error
 */
export const POST: APIRoute = async ({ locals, params, request }) => {
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

    // Validate path parameter
    const validatedParams = flyerIdParamSchema.parse(params);

    // Validate request body
    const body = await request.json();
    const validatedBody = extractFlyerCommandSchema.parse(body);

    // Verify that flyerId in body matches path parameter
    if (validatedBody.flyerId !== validatedParams.id) {
      return errorResponse("Flyer ID in request body does not match path parameter", 400);
    }

    // Trigger the extraction job
    const flyerService = new FlyerService(locals.supabase);
    const jobId = await flyerService.triggerExtractFlyer(validatedParams.id);

    const response: JobResponseDTO = { jobId };
    return jsonResponse(response, 202); // 202 Accepted for async operation
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return errorResponse("Invalid JSON in request body", 400);
    }

    // Handle validation errors
    if (error instanceof ZodError) {
      return errorResponse("Invalid request format", 400);
    }

    // Handle "Flyer not found" error from service
    if (error instanceof Error && error.message === "Flyer not found") {
      return errorResponse("Flyer not found", 404);
    }

    // Handle other errors
    // eslint-disable-next-line no-console
    console.error("Error in POST /api/flyers/:id/extract:", error);
    return errorResponse("Internal server error", 500);
  }
};
