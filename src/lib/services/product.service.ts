import type { SupabaseClient } from "../../db/supabase.client";
import type { ProductDTO, PaginatedResponse } from "../../types";

export class ProductService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Search and paginate products with optional full-text search and category filtering.
   * @param q Optional full-text search query
   * @param categoryId Optional category UUID filter
   * @param page Page number (1-indexed)
   * @param limit Number of items per page
   * @returns Promise<PaginatedResponse<ProductDTO>> Paginated products
   * @throws Error if database query fails
   */
  async search(q?: string, categoryId?: string, page = 1, limit = 20): Promise<PaginatedResponse<ProductDTO>> {
    try {
      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Start building the query
      let query = this.supabase
        .from("products")
        .select("id, name, description, image_url, brand, unit, category_id, normalized_name", {
          count: "exact",
        });

      // Apply full-text search if query provided
      if (q && q.trim()) {
        // Use textSearch on search_vector column for full-text search
        query = query.textSearch("search_vector", q.trim(), {
          type: "websearch",
          config: "english",
        });
      }

      // Apply category filter if provided
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      // Apply pagination and ordering
      query = query.order("name").range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to search products: ${error.message}`);
      }

      // Map database rows to ProductDTO
      const items: ProductDTO[] = (data || []).map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.image_url,
        brand: product.brand,
        unit: product.unit,
        categoryId: product.category_id,
        normalizedName: product.normalized_name,
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
      console.error("ProductService.search failed:", error);
      throw error;
    }
  }

  /**
   * Retrieves a single product by ID.
   * @param id Product UUID
   * @returns Promise<ProductDTO | null> Product or null if not found
   * @throws Error if database query fails
   */
  async getById(id: string): Promise<ProductDTO | null> {
    try {
      const { data, error } = await this.supabase
        .from("products")
        .select("id, name, description, image_url, brand, unit, category_id, normalized_name")
        .eq("id", id)
        .single();

      if (error) {
        // Supabase returns PGRST116 error code when no rows found
        if (error.code === "PGRST116") {
          return null;
        }
        throw new Error(`Failed to fetch product: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      // Map database row to ProductDTO
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        imageUrl: data.image_url,
        brand: data.brand,
        unit: data.unit,
        categoryId: data.category_id,
        normalizedName: data.normalized_name,
      };
    } catch (error) {
      // Log error for production tracking
      // eslint-disable-next-line no-console
      console.error("ProductService.getById failed:", error);
      throw error;
    }
  }
}
