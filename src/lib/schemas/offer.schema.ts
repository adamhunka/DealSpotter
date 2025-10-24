import { z } from "astro/zod";

/**
 * Schema for validating query parameters in GET /api/offers
 * Supports filtering by store, category, sorting, and pagination
 */
export const listOffersQuerySchema = z.object({
  // Optional store ID filter (UUID format)
  storeId: z.string().uuid().optional(),

  // Optional category ID filter (UUID format)
  categoryId: z.string().uuid().optional(),

  // Sort order enum with default value
  sort: z
    .enum([
      "promoPrice_asc",
      "promoPrice_desc",
      "discountPercentage_asc",
      "discountPercentage_desc",
      "validFrom_asc",
      "validFrom_desc",
      "createdAt_asc",
      "createdAt_desc",
    ])
    .optional()
    .default("promoPrice_desc"),

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
 * Schema for validating path parameter in GET /api/offers/:id
 */
export const offerIdParamSchema = z.object({
  id: z.string().uuid({
    message: "Invalid offer ID format. Expected UUID.",
  }),
});

// Export inferred types for use in handlers
export type ListOffersQuery = z.infer<typeof listOffersQuerySchema>;
export type OfferIdParam = z.infer<typeof offerIdParamSchema>;
