// src/lib/schemas/log.schema.ts

import { z } from "zod";

// Base pagination schema used by both log query schemas
const basePaginationSchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be >= 1"),
  limit: z.coerce.number().int().min(1, "Limit must be >= 1").max(100, "Limit must be <= 100"),
});

// Schema for extraction logs query parameters
export const extractionLogsQuerySchema = basePaginationSchema.extend({
  flyerId: z.string().uuid("Invalid flyer ID format").optional(),
  status: z
    .enum(["success", "error", "partial"], {
      errorMap: () => ({ message: "Status must be one of: success, error, partial" }),
    })
    .optional(),
});

// Schema for LLM logs query parameters
export const llmLogsQuerySchema = basePaginationSchema.extend({
  model: z.string().min(1, "Model name cannot be empty").optional(),
  status: z
    .enum(["success", "error", "timeout"], {
      errorMap: () => ({ message: "Status must be one of: success, error, timeout" }),
    })
    .optional(),
});

// Infer TypeScript types from schemas - these serve as Command models
export type ExtractionLogsQueryCommand = z.infer<typeof extractionLogsQuerySchema>;
export type LLMLogsQueryCommand = z.infer<typeof llmLogsQuerySchema>;
