import type { APIRoute } from "astro";
import { CategoryService } from "../../../lib/services/category.service";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    const categoryService = new CategoryService(locals.supabase);
    const categories = await categoryService.getAll();

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("GET /categories failed:", error);

    // Return 500 for any internal errors
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
