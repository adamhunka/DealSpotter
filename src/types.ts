// src/types.ts

import type { Database } from "./db/database.types";

export type Store = Database["public"]["Tables"]["stores"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Flyer = Database["public"]["Tables"]["flyers"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Offer = Database["public"]["Tables"]["product_offers"]["Row"];
export type PriceHistory = Database["public"]["Tables"]["price_history"]["Row"];
export type ExtractionLog = Database["public"]["Tables"]["extraction_logs"]["Row"];
export type LLMLog = Database["public"]["Tables"]["llm_logs"]["Row"];
export type ParsingErrorStat = Database["public"]["Views"]["parsing_error_stats"]["Row"];

// Pagination metadata returned in paginated responses
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

// Generic paginated response wrapper
interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// Response DTO for Store resource
export interface StoreDTO {
  id: Store["id"];
  name: Store["name"];
  slug: Store["slug"];
  logoUrl: Store["logo_url"];
}

// Response DTO for Category resource
export interface CategoryDTO {
  id: Category["id"];
  name: Category["name"];
  slug: Category["slug"];
}

// Response DTO for Flyer resource
export interface FlyerDTO {
  id: Flyer["id"];
  issueDate: Flyer["issue_date"];
  validFrom: Flyer["valid_from"];
  validTo: Flyer["valid_to"];
  sourceUrl: Flyer["source_url"];
  storeId: Flyer["store_id"];
  extractionStatus: Flyer["extraction_status"];
  errorCount: Flyer["error_count"];
  extractionCompletedAt: Flyer["extraction_completed_at"];
}

// Response DTO for Product resource
export interface ProductDTO {
  id: Product["id"];
  name: Product["name"];
  description: Product["description"];
  imageUrl: Product["image_url"];
  brand: Product["brand"];
  unit: Product["unit"];
  categoryId: Product["category_id"];
  normalizedName: Product["normalized_name"];
}

// Response DTO for Product Offer resource
export interface OfferDTO {
  id: Offer["id"];
  flyerId: Offer["flyer_id"];
  productId: Offer["product_id"];
  promoPrice: Offer["promo_price"];
  regularPrice: Offer["regular_price"];
  discountPercentage: Offer["discount_percentage"];
  extractionConfidence: Offer["extraction_confidence"];
  manuallyVerified: Offer["manually_verified"];
  pageNumber: Offer["page_number"];
  conditions: Offer["conditions"];
  validFrom: Offer["valid_from"];
  validTo: Offer["valid_to"];
  createdAt: Offer["created_at"];
  updatedAt: Offer["updated_at"];
}

// Response DTO for Price History resource
export interface PriceHistoryDTO {
  id: PriceHistory["id"];
  price: PriceHistory["price"];
  priceType: PriceHistory["price_type"];
  productId: PriceHistory["product_id"];
  sourceOfferId: PriceHistory["source_offer_id"];
  storeId: PriceHistory["store_id"];
  validFrom: PriceHistory["valid_from"];
  validTo: PriceHistory["valid_to"];
  createdAt: PriceHistory["created_at"];
}

// Response DTO for Extraction Log resource
export interface ExtractionLogDTO {
  id: ExtractionLog["id"];
  flyerId: ExtractionLog["flyer_id"];
  productOfferId: ExtractionLog["product_offer_id"];
  extractionType: ExtractionLog["extraction_type"];
  status: ExtractionLog["status"];
  errorMessage: ExtractionLog["error_message"];
  metadata: ExtractionLog["metadata"];
  createdAt: ExtractionLog["created_at"];
}

// Response DTO for LLM Log resource
export interface LLMLogDTO {
  id: LLMLog["id"];
  flyerId: LLMLog["flyer_id"];
  productOfferId: LLMLog["product_offer_id"];
  model: LLMLog["model"];
  request: LLMLog["request"];
  response: LLMLog["response"];
  status: LLMLog["status"];
  errorMessage: LLMLog["error_message"];
  costUsd: LLMLog["cost_usd"];
  durationMs: LLMLog["duration_ms"];
  tokensInput: LLMLog["tokens_input"];
  tokensOutput: LLMLog["tokens_output"];
  createdAt: LLMLog["created_at"];
}

// Response DTO for Parsing Error Stats resource
export interface ParsingErrorStatDTO {
  weekStart: ParsingErrorStat["week_start"];
  storeId: ParsingErrorStat["store_id"];
  errorRate: ParsingErrorStat["error_rate_percentage"];
  total: ParsingErrorStat["total_extractions"];
}

// Command model for triggering flyer PDF fetch job (POST /flyers/fetch)
export type FetchFlyersCommand = Record<string, never>;

// Command model for triggering extraction on a specific flyer (POST /flyers/:id/extract)
export interface ExtractFlyerCommand {
  flyerId: string;
}

// Generic Job Response DTO for POST operations returning a job ID
export interface JobResponseDTO {
  jobId: string;
}

// Export common types for use in API handlers
export type { PaginationMeta, PaginatedResponse };
