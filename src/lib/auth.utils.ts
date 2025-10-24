// src/lib/auth.utils.ts

import type { SupabaseClient } from "../db/supabase.client";

/**
 * Result of admin role verification
 */
export interface AdminCheckResult {
  isAuthorized: boolean;
  error?: {
    message: string;
    status: 401 | 403;
  };
}

/**
 * Verifies that the current user has admin role
 *
 * @param supabase - Supabase client from context.locals
 * @returns Object with authorization status and optional error details
 */
export async function verifyAdminRole(supabase: SupabaseClient): Promise<AdminCheckResult> {
  // Check authentication - get current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  // Handle authentication errors or missing session
  if (sessionError || !session) {
    return {
      isAuthorized: false,
      error: {
        message: "Unauthorized",
        status: 401,
      },
    };
  }

  // Check if user has admin role in metadata
  const userRole = session.user.user_metadata?.role;
  if (userRole !== "admin") {
    return {
      isAuthorized: false,
      error: {
        message: "Forbidden: Admin access required",
        status: 403,
      },
    };
  }

  // User is authenticated and has admin role
  return {
    isAuthorized: true,
  };
}
