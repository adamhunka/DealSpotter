export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          id: string;
          metadata: Json | null;
          new_values: Json | null;
          old_values: Json | null;
          operation: string;
          record_id: string;
          table_name: string;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          id?: string;
          metadata?: Json | null;
          new_values?: Json | null;
          old_values?: Json | null;
          operation: string;
          record_id: string;
          table_name: string;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          id?: string;
          metadata?: Json | null;
          new_values?: Json | null;
          old_values?: Json | null;
          operation?: string;
          record_id?: string;
          table_name?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          icon: string | null;
          id: string;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          icon?: string | null;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          icon?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      extraction_logs: {
        Row: {
          created_at: string;
          error_message: string | null;
          extraction_type: string;
          flyer_id: string;
          id: string;
          metadata: Json | null;
          product_offer_id: string | null;
          status: string;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          extraction_type: string;
          flyer_id: string;
          id?: string;
          metadata?: Json | null;
          product_offer_id?: string | null;
          status: string;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          extraction_type?: string;
          flyer_id?: string;
          id?: string;
          metadata?: Json | null;
          product_offer_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "extraction_logs_flyer_id_fkey";
            columns: ["flyer_id"];
            isOneToOne: false;
            referencedRelation: "flyers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "extraction_logs_product_offer_id_fkey";
            columns: ["product_offer_id"];
            isOneToOne: false;
            referencedRelation: "product_offers";
            referencedColumns: ["id"];
          },
        ];
      };
      flyers: {
        Row: {
          created_at: string;
          error_count: number;
          extraction_completed_at: string | null;
          extraction_status: string;
          id: string;
          issue_date: string;
          source_url: string | null;
          store_id: string;
          updated_at: string;
          valid_from: string;
          valid_to: string;
        };
        Insert: {
          created_at?: string;
          error_count?: number;
          extraction_completed_at?: string | null;
          extraction_status?: string;
          id?: string;
          issue_date: string;
          source_url?: string | null;
          store_id: string;
          updated_at?: string;
          valid_from: string;
          valid_to: string;
        };
        Update: {
          created_at?: string;
          error_count?: number;
          extraction_completed_at?: string | null;
          extraction_status?: string;
          id?: string;
          issue_date?: string;
          source_url?: string | null;
          store_id?: string;
          updated_at?: string;
          valid_from?: string;
          valid_to?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flyers_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      llm_logs: {
        Row: {
          cost_usd: number | null;
          created_at: string;
          duration_ms: number | null;
          error_message: string | null;
          flyer_id: string | null;
          id: string;
          model: string;
          product_offer_id: string | null;
          request: Json;
          response: Json;
          status: string;
          tokens_input: number | null;
          tokens_output: number | null;
        };
        Insert: {
          cost_usd?: number | null;
          created_at?: string;
          duration_ms?: number | null;
          error_message?: string | null;
          flyer_id?: string | null;
          id?: string;
          model: string;
          product_offer_id?: string | null;
          request: Json;
          response: Json;
          status: string;
          tokens_input?: number | null;
          tokens_output?: number | null;
        };
        Update: {
          cost_usd?: number | null;
          created_at?: string;
          duration_ms?: number | null;
          error_message?: string | null;
          flyer_id?: string | null;
          id?: string;
          model?: string;
          product_offer_id?: string | null;
          request?: Json;
          response?: Json;
          status?: string;
          tokens_input?: number | null;
          tokens_output?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "llm_logs_flyer_id_fkey";
            columns: ["flyer_id"];
            isOneToOne: false;
            referencedRelation: "flyers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "llm_logs_product_offer_id_fkey";
            columns: ["product_offer_id"];
            isOneToOne: false;
            referencedRelation: "product_offers";
            referencedColumns: ["id"];
          },
        ];
      };
      price_history: {
        Row: {
          created_at: string;
          id: string;
          price: number;
          price_type: string;
          product_id: string;
          source_offer_id: string | null;
          store_id: string;
          valid_from: string;
          valid_to: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          price: number;
          price_type: string;
          product_id: string;
          source_offer_id?: string | null;
          store_id: string;
          valid_from: string;
          valid_to?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          price?: number;
          price_type?: string;
          product_id?: string;
          source_offer_id?: string | null;
          store_id?: string;
          valid_from?: string;
          valid_to?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "price_history_source_offer_id_fkey";
            columns: ["source_offer_id"];
            isOneToOne: false;
            referencedRelation: "product_offers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "price_history_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      product_offers: {
        Row: {
          conditions: Json | null;
          created_at: string;
          discount_percentage: number | null;
          extraction_confidence: number | null;
          flyer_id: string;
          id: string;
          manually_verified: boolean;
          page_number: number | null;
          product_id: string;
          promo_price: number;
          regular_price: number | null;
          updated_at: string;
          valid_from: string;
          valid_to: string;
        };
        Insert: {
          conditions?: Json | null;
          created_at?: string;
          discount_percentage?: number | null;
          extraction_confidence?: number | null;
          flyer_id: string;
          id?: string;
          manually_verified?: boolean;
          page_number?: number | null;
          product_id: string;
          promo_price: number;
          regular_price?: number | null;
          updated_at?: string;
          valid_from: string;
          valid_to: string;
        };
        Update: {
          conditions?: Json | null;
          created_at?: string;
          discount_percentage?: number | null;
          extraction_confidence?: number | null;
          flyer_id?: string;
          id?: string;
          manually_verified?: boolean;
          page_number?: number | null;
          product_id?: string;
          promo_price?: number;
          regular_price?: number | null;
          updated_at?: string;
          valid_from?: string;
          valid_to?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_offers_flyer_id_fkey";
            columns: ["flyer_id"];
            isOneToOne: false;
            referencedRelation: "flyers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_offers_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          brand: string | null;
          category_id: string | null;
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          name: string;
          normalized_name: string;
          search_vector: unknown;
          unit: string | null;
          updated_at: string;
        };
        Insert: {
          brand?: string | null;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          normalized_name: string;
          search_vector?: unknown;
          unit?: string | null;
          updated_at?: string;
        };
        Update: {
          brand?: string | null;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          normalized_name?: string;
          search_vector?: unknown;
          unit?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      stores: {
        Row: {
          created_at: string;
          id: string;
          logo_url: string | null;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      parsing_error_stats: {
        Row: {
          error_count: number | null;
          error_rate_percentage: number | null;
          last_extraction: string | null;
          store_id: string | null;
          store_name: string | null;
          total_extractions: number | null;
          week_start: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "flyers_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      check_parsing_error_threshold: { Args: never; Returns: undefined };
      cleanup_old_logs: { Args: never; Returns: undefined };
      refresh_parsing_error_stats: { Args: never; Returns: undefined };
      unaccent: { Args: { "": string }; Returns: string };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
