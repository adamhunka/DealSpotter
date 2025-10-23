import { z } from "astro/zod";

/**
 * Schema for validating query parameters in GET /api/flyers
 * Supports filtering by store, validity date range, and pagination
 */
export const listFlyersQuerySchema = z.object({
  // Optional store ID filter (UUID format)
  storeId: z.string().uuid().optional(),

  // Optional filter for currently valid flyers (validFrom <= today <= validTo)
  valid: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === "") return undefined;
      return val === "true";
    }),

  // Pagination: page number (minimum 1, default 1)
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),

  // Pagination: items per page (minimum 1, maximum 100, default 20)
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
});

/**
 * Schema for validating path parameter in GET /api/flyers/:id
 */
export const flyerIdParamSchema = z.object({
  id: z.string().uuid({
    message: "Invalid flyer ID format. Expected UUID.",
  }),
});

/**
 * Schema for validating POST /api/flyers/fetch body
 * Empty object as this is just a trigger command
 */
export const fetchFlyersCommandSchema = z.object({});

/**
 * Schema for validating POST /api/flyers/:id/extract body
 */
export const extractFlyerCommandSchema = z.object({
  flyerId: z.string().uuid({
    message: "Invalid flyer ID format. Expected UUID.",
  }),
});

// Export inferred types for use in handlers
export type ListFlyersQuery = z.infer<typeof listFlyersQuerySchema>;
export type FlyerIdParam = z.infer<typeof flyerIdParamSchema>;
export type FetchFlyersCommand = z.infer<typeof fetchFlyersCommandSchema>;
export type ExtractFlyerCommand = z.infer<typeof extractFlyerCommandSchema>;
