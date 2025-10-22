import { describe, expect, it, vi } from "vitest";
import { GET } from "./stores";
import type { StoreDTO } from "../../types";

const mockStores: StoreDTO[] = [
  {
    id: "1",
    name: "Test Store 1",
    slug: "test-store-1",
    logoUrl: "https://example.com/logo1.png",
  },
  {
    id: "2",
    name: "Test Store 2",
    slug: "test-store-2",
    logoUrl: null,
  },
];

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      order: vi.fn(() => ({
        data: mockStores,
        error: null,
      })),
    })),
  })),
};

describe("GET /api/stores", () => {
  it("should return list of stores", async () => {
    const request = new Request("https://example.com/api/stores");
    const context = {
      locals: { supabase: mockSupabase },
      url: new URL(request.url),
    };

    const response = await GET(context as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockStores);
  });

  it("should reject query parameters", async () => {
    const request = new Request("https://example.com/api/stores?filter=test");
    const context = {
      locals: { supabase: mockSupabase },
      url: new URL(request.url),
    };

    const response = await GET(context as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "No query parameters expected." });
  });

  it("should handle database errors", async () => {
    const errorSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: null,
            error: new Error("Database error"),
          })),
        })),
      })),
    };

    const request = new Request("https://example.com/api/stores");
    const context = {
      locals: { supabase: errorSupabase },
      url: new URL(request.url),
    };

    const response = await GET(context as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Internal server error." });
  });
});
