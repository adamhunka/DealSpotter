// src/lib/schemas/history.schema.ts

import { z } from "zod";

/**
 * Schema for validating query parameters for GET /api/history endpoint
 * Validates pagination params (page, limit) and optional filters (productId, storeId)
 */
export const historyQuerySchema = z.object({
  // Required pagination parameters
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1, "Page must be at least 1")),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100")),
  // Optional filter parameters
  productId: z.string().uuid("Invalid product ID format").optional(),
  storeId: z.string().uuid("Invalid store ID format").optional(),
});

export type HistoryQueryParams = z.infer<typeof historyQuerySchema>;
