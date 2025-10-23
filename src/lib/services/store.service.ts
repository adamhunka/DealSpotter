import type { SupabaseClient } from "../../db/supabase.client";
import type { StoreDTO } from "../../types";

export class StoreService {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(): Promise<StoreDTO[]> {
    const { data, error } = await this.supabase
      .from("stores")
      .select("id,name,slug,logo_url")
      .order("name", { ascending: true });

    if (error) {
      // We keep console.error for production error tracking
      console.error("Error fetching stores:", error);
      throw new Error("Failed to fetch stores");
    }

    if (!data) {
      return [];
    }

    return data.map(({ id, name, slug, logo_url }) => ({
      id,
      name,
      slug,
      logoUrl: logo_url,
    }));
  }
}
