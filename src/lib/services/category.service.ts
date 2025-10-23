import type { SupabaseClient } from "../db/supabase.client";
import type { CategoryDTO } from "../../types";

export class CategoryService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Retrieves all product categories from the database.
   * @returns Promise<CategoryDTO[]> Array of categories
   * @throws Error if database query fails
   */
  async getAll(): Promise<CategoryDTO[]> {
    try {
      const { data, error } = await this.supabase.from("categories").select("id,name,slug").order("name");

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      return data.map(
        (category: { id: string; name: string; slug: string }): CategoryDTO => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
        })
      );
    } catch (error) {
      // Log the error details for debugging
      console.error("CategoryService.getAll failed:", error);
      throw error;
    }
  }
}
