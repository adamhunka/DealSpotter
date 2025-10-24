import type { APIRoute } from "astro";
import { OfferService } from "../../../lib/services/offer.service";
import { listOffersQuerySchema } from "../../../lib/schemas/offer.schema";

export const prerender = false;

/**
 * GET /api/offers
 * List and paginate offers with optional filtering and sorting
 * Query parameters:
 * - storeId: UUID of store to filter by (optional)
 * - categoryId: UUID of category to filter by (optional)
 * - sort: sort order enum, default "promoPrice_desc" (optional)
 * - page: page number, min 1, default 1 (optional)
 * - limit: items per page, min 1, max 100, default 20 (optional)
 */
export const GET: APIRoute = async ({ locals, url }) => {
  try {
    // Extract query parameters from URL
    const queryParams = {
      storeId: url.searchParams.get("storeId") || undefined,
      categoryId: url.searchParams.get("categoryId") || undefined,
      sort: url.searchParams.get("sort") || undefined,
      page: url.searchParams.get("page") || undefined,
      limit: url.searchParams.get("limit") || undefined,
    };

    // Validate query parameters using Zod schema
    const validation = listOffersQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: validation.error.errors,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { storeId, categoryId, sort, page, limit } = validation.data;

    // Use offer service to list offers
    const offerService = new OfferService(locals.supabase);
    const result = await offerService.list(storeId, categoryId, sort, page, limit);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("GET /api/offers failed:", error);

    // Return 500 for any internal errors
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
