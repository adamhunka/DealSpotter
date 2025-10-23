import type { APIRoute } from "astro";
import { ProductService } from "../../../lib/services/product.service";
import { productIdParamSchema } from "../../../lib/schemas/product.schema";

export const prerender = false;

/**
 * GET /api/products/:id
 * Retrieve a single product by its UUID
 * Path parameter:
 * - id: UUID of the product
 */
export const GET: APIRoute = async ({ locals, params }) => {
  try {
    // Validate path parameter using Zod schema
    const validation = productIdParamSchema.safeParse(params);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid product ID",
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

    const { id } = validation.data;

    // Use product service to get product by ID
    const productService = new ProductService(locals.supabase);
    const product = await productService.getById(id);

    // Return 404 if product not found
    if (!product) {
      return new Response(
        JSON.stringify({
          error: "Product not found",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(JSON.stringify(product), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("GET /api/products/:id failed:", error);

    // Return 500 for any internal errors
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

