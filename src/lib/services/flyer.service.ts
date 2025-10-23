import type { SupabaseClient } from "../../db/supabase.client";
import type { FlyerDTO, PaginatedResponse, PaginationMeta } from "../../types";

/**
 * Filter options for listing flyers
 */
export interface FlyerListFilter {
  storeId?: string;
  valid?: boolean;
}

/**
 * Service class for managing flyer-related operations
 * Handles database interactions for flyers resource
 */
export class FlyerService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * List flyers with optional filtering and pagination
   * @param filter - Optional filters (storeId, valid date range)
   * @param page - Page number (1-indexed)
   * @param limit - Number of items per page
   * @returns Paginated list of flyers
   */
  async listFlyers(filter: FlyerListFilter, page: number, limit: number): Promise<PaginatedResponse<FlyerDTO>> {
    // Build the query
    let query = this.supabase
      .from("flyers")
      .select(
        "id, issue_date, valid_from, valid_to, source_url, store_id, extraction_status, error_count, extraction_completed_at",
        { count: "exact" }
      );

    // Apply store filter if provided
    if (filter.storeId) {
      query = query.eq("store_id", filter.storeId);
    }

    // Apply validity date filter if requested
    if (filter.valid === true) {
      const today = new Date().toISOString().split("T")[0];
      query = query.lte("valid_from", today).gte("valid_to", today);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.order("issue_date", { ascending: false }).range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      // Log error for production tracking
      // eslint-disable-next-line no-console
      console.error("Error fetching flyers:", error);
      throw new Error("Failed to fetch flyers");
    }

    if (!data) {
      return {
        items: [],
        pagination: {
          page,
          limit,
          total: 0,
        },
      };
    }

    // Map database rows to DTOs
    const items: FlyerDTO[] = data.map((row) => ({
      id: row.id,
      issueDate: row.issue_date,
      validFrom: row.valid_from,
      validTo: row.valid_to,
      sourceUrl: row.source_url,
      storeId: row.store_id,
      extractionStatus: row.extraction_status,
      errorCount: row.error_count,
      extractionCompletedAt: row.extraction_completed_at,
    }));

    const pagination: PaginationMeta = {
      page,
      limit,
      total: count ?? 0,
    };

    return {
      items,
      pagination,
    };
  }

  /**
   * Get a single flyer by ID
   * @param id - Flyer UUID
   * @returns Flyer DTO or null if not found
   */
  async getFlyerById(id: string): Promise<FlyerDTO | null> {
    const { data, error } = await this.supabase
      .from("flyers")
      .select(
        "id, issue_date, valid_from, valid_to, source_url, store_id, extraction_status, error_count, extraction_completed_at"
      )
      .eq("id", id)
      .single();

    if (error) {
      // Check if it's a "not found" error
      if (error.code === "PGRST116") {
        return null;
      }
      // Log error for production tracking
      // eslint-disable-next-line no-console
      console.error("Error fetching flyer by ID:", error);
      throw new Error("Failed to fetch flyer");
    }

    if (!data) {
      return null;
    }

    // Map to DTO
    return {
      id: data.id,
      issueDate: data.issue_date,
      validFrom: data.valid_from,
      validTo: data.valid_to,
      sourceUrl: data.source_url,
      storeId: data.store_id,
      extractionStatus: data.extraction_status,
      errorCount: data.error_count,
      extractionCompletedAt: data.extraction_completed_at,
    };
  }

  /**
   * Trigger a background job to fetch latest flyer PDFs from all stores
   * This is an admin-only operation
   * @returns Job ID for tracking the background task
   */
  async triggerFetchFlyers(): Promise<string> {
    // TODO: Implement actual job queue integration (e.g., BullMQ, pg-boss, etc.)
    // For now, we'll simulate a job ID
    // In production, this would:
    // 1. Create a job in the queue
    // 2. Return the job ID
    // 3. Background worker would process the job

    const jobId = crypto.randomUUID();

    // Log job creation for tracking
    // eslint-disable-next-line no-console
    console.log(`Triggered fetch flyers job with ID: ${jobId}`);

    // TODO: Enqueue job to background processing system
    // Example: await jobQueue.add('fetch-flyers', {}, { jobId });

    return jobId;
  }

  /**
   * Trigger extraction of content from a specific flyer PDF
   * This is an admin-only operation
   * @param flyerId - UUID of the flyer to extract
   * @returns Job ID for tracking the background task
   */
  async triggerExtractFlyer(flyerId: string): Promise<string> {
    // First verify that the flyer exists
    const flyer = await this.getFlyerById(flyerId);

    if (!flyer) {
      throw new Error("Flyer not found");
    }

    // TODO: Implement actual job queue integration
    // For now, we'll simulate a job ID
    // In production, this would:
    // 1. Create a job in the queue with the flyerId
    // 2. Return the job ID
    // 3. Background worker would process the extraction

    const jobId = crypto.randomUUID();

    // Log job creation for tracking
    // eslint-disable-next-line no-console
    console.log(`Triggered extract flyer job for flyer ${flyerId} with job ID: ${jobId}`);

    // TODO: Enqueue job to background processing system
    // Example: await jobQueue.add('extract-flyer', { flyerId }, { jobId });

    return jobId;
  }
}
