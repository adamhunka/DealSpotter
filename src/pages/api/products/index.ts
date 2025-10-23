import type { APIRoute } from "astro";
import { ProductService } from "../../../lib/services/product.service";
import { listProductsQuerySchema } from "../../../lib/schemas/product.schema";

export const prerender = false;

/**
 * GET /api/products
 * Search and paginate products with optional filtering
 * Query parameters:
 * - q: full-text search query (optional)
 * - categoryId: UUID of category to filter by (optional)
 * - page: page number, min 1, default 1 (optional)
 * - limit: items per page, min 1, max 100, default 20 (optional)
 */
export const GET: APIRoute = async ({ locals, url }) => {
  try {
    // Extract query parameters from URL
    const queryParams = {
      q: url.searchParams.get("q") || undefined,
      categoryId: url.searchParams.get("categoryId") || undefined,
      page: url.searchParams.get("page") || undefined,
      limit: url.searchParams.get("limit") || undefined,
    };

    // Validate query parameters using Zod schema
    const validation = listProductsQuerySchema.safeParse(queryParams);

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

    const { q, categoryId, page, limit } = validation.data;

    // Use product service to search
    const productService = new ProductService(locals.supabase);
    const result = await productService.search(q, categoryId, page, limit);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("GET /api/products failed:", error);

    // Return 500 for any internal errors
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
