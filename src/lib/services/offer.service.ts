import type { SupabaseClient } from "../../db/supabase.client";
import type { OfferDTO, PaginatedResponse } from "../../types";

export class OfferService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * List and paginate offers with optional filtering and sorting.
   * @param storeId Optional store UUID filter
   * @param categoryId Optional category UUID filter
   * @param sort Sort order (field_direction format)
   * @param page Page number (1-indexed)
   * @param limit Number of items per page
   * @returns Promise<PaginatedResponse<OfferDTO>> Paginated offers
   * @throws Error if database query fails
   */
  async list(
    storeId?: string,
    categoryId?: string,
    sort = "promoPrice_desc",
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<OfferDTO>> {
    try {
      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // If we need to filter by storeId, we must first get matching flyer IDs
      let flyerIds: string[] | undefined;
      if (storeId) {
        const { data: flyers, error: flyerError } = await this.supabase
          .from("flyers")
          .select("id")
          .eq("store_id", storeId);

        if (flyerError) {
          throw new Error(`Failed to filter by store: ${flyerError.message}`);
        }

        flyerIds = flyers?.map((f) => f.id) || [];

        // If no flyers found for this store, return empty result
        if (flyerIds.length === 0) {
          return {
            items: [],
            pagination: {
              page,
              limit,
              total: 0,
            },
          };
        }
      }

      // If we need to filter by categoryId, we must first get matching product IDs
      let productIds: string[] | undefined;
      if (categoryId) {
        const { data: products, error: productError } = await this.supabase
          .from("products")
          .select("id")
          .eq("category_id", categoryId);

        if (productError) {
          throw new Error(`Failed to filter by category: ${productError.message}`);
        }

        productIds = products?.map((p) => p.id) || [];

        // If no products found for this category, return empty result
        if (productIds.length === 0) {
          return {
            items: [],
            pagination: {
              page,
              limit,
              total: 0,
            },
          };
        }
      }

      // Start building the main query
      let query = this.supabase.from("product_offers").select(
        `
          id,
          flyer_id,
          product_id,
          promo_price,
          regular_price,
          discount_percentage,
          extraction_confidence,
          manually_verified,
          page_number,
          conditions,
          valid_from,
          valid_to,
          created_at,
          updated_at
        `,
        {
          count: "exact",
        }
      );

      // Apply flyer filter if storeId was provided
      if (flyerIds) {
        query = query.in("flyer_id", flyerIds);
      }

      // Apply product filter if categoryId was provided
      if (productIds) {
        query = query.in("product_id", productIds);
      }

      // Parse sort parameter and apply ordering
      const [sortField, sortDirection] = sort.split("_");
      const ascending = sortDirection === "asc";

      // Map sort field names to database column names
      const sortColumnMap: Record<string, string> = {
        promoPrice: "promo_price",
        discountPercentage: "discount_percentage",
        validFrom: "valid_from",
        createdAt: "created_at",
      };

      const columnName = sortColumnMap[sortField] || "promo_price";
      query = query.order(columnName, { ascending });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to list offers: ${error.message}`);
      }

      // Map database rows to OfferDTO
      const items: OfferDTO[] = (data || []).map((offer) => ({
        id: offer.id,
        flyerId: offer.flyer_id,
        productId: offer.product_id,
        promoPrice: offer.promo_price,
        regularPrice: offer.regular_price,
        discountPercentage: offer.discount_percentage,
        extractionConfidence: offer.extraction_confidence,
        manuallyVerified: offer.manually_verified,
        pageNumber: offer.page_number,
        conditions: offer.conditions,
        validFrom: offer.valid_from,
        validTo: offer.valid_to,
        createdAt: offer.created_at,
        updatedAt: offer.updated_at,
      }));

      return {
        items,
        pagination: {
          page,
          limit,
          total: count || 0,
        },
      };
    } catch (error) {
      // Log error for production tracking
      // eslint-disable-next-line no-console
      console.error("OfferService.list failed:", error);
      throw error;
    }
  }

  /**
   * Retrieves a single offer by ID.
   * @param id Offer UUID
   * @returns Promise<OfferDTO | null> Offer or null if not found
   * @throws Error if database query fails
   */
  async getById(id: string): Promise<OfferDTO | null> {
    try {
      const { data, error } = await this.supabase
        .from("product_offers")
        .select(
          `
          id,
          flyer_id,
          product_id,
          promo_price,
          regular_price,
          discount_percentage,
          extraction_confidence,
          manually_verified,
          page_number,
          conditions,
          valid_from,
          valid_to,
          created_at,
          updated_at
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        // Supabase returns PGRST116 error code when no rows found
        if (error.code === "PGRST116") {
          return null;
        }
        throw new Error(`Failed to fetch offer: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      // Map database row to OfferDTO
      return {
        id: data.id,
        flyerId: data.flyer_id,
        productId: data.product_id,
        promoPrice: data.promo_price,
        regularPrice: data.regular_price,
        discountPercentage: data.discount_percentage,
        extractionConfidence: data.extraction_confidence,
        manuallyVerified: data.manually_verified,
        pageNumber: data.page_number,
        conditions: data.conditions,
        validFrom: data.valid_from,
        validTo: data.valid_to,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      // Log error for production tracking
      // eslint-disable-next-line no-console
      console.error("OfferService.getById failed:", error);
      throw error;
    }
  }
}
