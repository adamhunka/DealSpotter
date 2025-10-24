import { z } from "astro/zod";

/**
 * Schema for validating query parameters in GET /api/products
 * Supports full-text search, category filtering, and pagination
 */
export const listProductsQuerySchema = z.object({
  // Optional full-text search query
  q: z.string().optional(),

  // Optional category ID filter (UUID format)
  categoryId: z.string().uuid().optional(),

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
 * Schema for validating path parameter in GET /api/products/:id
 */
export const productIdParamSchema = z.object({
  id: z.string().uuid({
    message: "Invalid product ID format. Expected UUID.",
  }),
});

// Export inferred types for use in handlers
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;

