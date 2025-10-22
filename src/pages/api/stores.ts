import type { APIRoute } from "astro";
import { StoreService } from "../../lib/services/store.service";
import { errorResponse, jsonResponse } from "../../lib/api.utils";

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  // Reject any query parameters
  if (url.search !== "") {
    return errorResponse("No query parameters expected.", 400);
  }

  try {
    const storeService = new StoreService(locals.supabase);
    const stores = await storeService.list();

    return jsonResponse(stores);
  } catch (error) {
    console.error("Error in GET /api/stores:", error);
    return errorResponse("Internal server error.", 500);
  }
};
