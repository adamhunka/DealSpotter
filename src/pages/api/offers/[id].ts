import type { APIRoute } from "astro";
import { OfferService } from "../../../lib/services/offer.service";
import { offerIdParamSchema } from "../../../lib/schemas/offer.schema";

export const prerender = false;

/**
 * GET /api/offers/:id
 * Get a single offer by UUID
 * Path parameter:
 * - id: UUID of the offer
 */
export const GET: APIRoute = async ({ locals, params }) => {
  try {
    // Validate path parameter using Zod schema
    const validation = offerIdParamSchema.safeParse(params);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid offer ID",
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

    // Use offer service to get offer by ID
    const offerService = new OfferService(locals.supabase);
    const offer = await offerService.getById(id);

    // Return 404 if offer not found
    if (!offer) {
      return new Response(JSON.stringify({ error: "Offer not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Return offer data
    return new Response(JSON.stringify(offer), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("GET /api/offers/:id failed:", error);

    // Return 500 for any internal errors
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
