// src/pages/api/stats/parsing-errors.ts

import type { APIRoute } from "astro";
import { StatsService } from "../../../lib/services/stats.service";
import { verifyAdminRole } from "../../../lib/auth.utils";

/**
 * GET /api/stats/parsing-errors
 *
 * Returns weekly parsing error statistics from the materialized view.
 * Requires admin authentication.
 *
 * @returns 200 OK with array of ParsingErrorStatDTO
 * @returns 401 Unauthorized if not authenticated
 * @returns 403 Forbidden if user doesn't have admin role
 * @returns 500 Internal Server Error on database failure
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    const supabase = locals.supabase;

    // Verify admin role authorization
    const adminCheck = await verifyAdminRole(supabase);
    if (!adminCheck.isAuthorized) {
      return new Response(JSON.stringify({ error: adminCheck.error!.message }), {
        status: adminCheck.error!.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialize service and fetch parsing error statistics
    const statsService = new StatsService(supabase);
    const stats = await statsService.getParsingErrorStats();

    // Return successful response
    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log unexpected errors
    console.error("Error fetching parsing error stats:", error);

    // Return generic error response
    return new Response(
      JSON.stringify({
        error: "Internal server error while fetching parsing error statistics",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Disable prerendering for this API route (server-side only)
export const prerender = false;
