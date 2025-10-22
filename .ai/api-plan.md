# REST API Plan

## 1. Resources
- **Stores** → `stores` table
- **Flyers** → `flyers` table
- **Categories** → `categories` table
- **Products** → `products` table
- **Product Offers** → `product_offers` table
- **Price History** → `price_history` table
- **Extraction Logs** → `extraction_logs` table
- **LLM Logs** → `llm_logs` table
- **Parsing Error Stats** → materialized view `parsing_error_stats`

## 2. Endpoints

### 2.2 Stores

#### GET /stores
- Description: List all stores in alphabetical order by name
- Authentication: Required
- Query params: none (any provided parameters will result in 400)
- Headers:
  - Required: `Authorization: Bearer <token>`
  - Response: `Content-Type: application/json`
- Response:
  - 200 OK: Array of stores
    ```typescript
    [
      {
        "id": UUID,      // Store unique identifier
        "name": string,  // Display name
        "slug": string,  // URL-friendly identifier
        "logoUrl": string | null  // Optional URL to store logo
      }
    ]
    ```
  - 400 Bad Request: When query parameters are provided
    ```typescript
    {
      "error": "No query parameters expected."
    }
    ```
  - 401 Unauthorized: When token is missing or invalid
  - 500 Internal Server Error: On database errors
    ```typescript
    {
      "error": "Internal server error."
    }
    ```
- Performance considerations:
  - B-tree index on `name` for sorting
  - No pagination needed (limited number of stores)
  - Potential for caching due to infrequent updates

### 2.3 Flyers

#### GET /flyers
- Description: List flyers
- Query: `storeId?: UUID`, `valid?: boolean`, `page?: number`, `limit?: number`
- Response 200: `{ "items": Flyer[], "pagination": { page, limit, total } }`

#### GET /flyers/:id
- Description: Get flyer details
- Response 200: `Flyer` including `extractionStatus`, `errorCount`

#### POST /flyers/fetch
- Description: Trigger manual fetch of latest PDFs
- Protected: admin
- Response 202: `{ "jobId": string }`

#### POST /flyers/:id/extract
- Description: Trigger extraction for one flyer
- Protected: admin
- Response 202: `{ "jobId": string }`

### 2.4 Categories

#### GET /categories
- Description: List categories
- Response 200: `[{ "id": UUID, "name": string, "slug": string }]`

### 2.5 Products

#### GET /products
- Description: Search products
- Query: `q?: string`, `categoryId?: UUID`, `page?: number`, `limit?: number`
- Response 200: `{ "items": Product[], "pagination": {...} }`

#### GET /products/:id
- Description: Get product details
- Response 200: `Product`

### 2.6 Product Offers

#### GET /offers
- Description: List promotional offers
- Query: `storeId?: UUID`, `categoryId?: UUID`, `sort=promoPrice_desc`, `page`, `limit`
- Response 200: `{ "items": Offer[], "pagination": {...} }`

#### GET /offers/:id
- Description: Get offer details
- Response 200: `Offer`

### 2.7 Price History

#### GET /history
- Description: Retrieve price history
- Query: `productId?: UUID`, `storeId?: UUID`, `page`, `limit`
- Response 200: `{ "items": HistoryRecord[], "pagination": {...} }`

### 2.8 Logs

#### GET /logs/extraction
- Description: Admin-only extraction logs
- Query: `flyerId?: UUID`, `status?: string`, `page`, `limit`
- Response 200: `ExtractionLog[]`

#### GET /logs/llm
- Description: Admin-only LLM logs
- Query: `model?: string`, `status?: string`, `page`, `limit`
- Response 200: `LLMLog[]`

### 2.9 Parsing Error Stats

#### GET /stats/parsing-errors
- Description: Weekly parsing error rates
- Response 200: `[{ "weekStart": string, "storeId": UUID, "errorRate": number, "total": number }]`

## 3. Authentication and Authorization
- Mechanism: JWT tokens issued via Supabase Auth
- Roles: user, admin (from `raw_user_meta_data->>'role'`)
- Public endpoints: GET for stores, flyers, categories, products, offers, history
- Admin endpoints: fetch/extract flyers, logs
- Token in `Authorization: Bearer <token>` header

## 4. Validation and Business Logic
- **Email/password**: non-empty, valid format; password min length 8
- **Flyer date span**: `validFrom <= validTo` (DB CHECK)
- **Offer price**: `promoPrice > 0`, `regularPrice >= promoPrice` (DB CHECK)
- **Discount**: 0 <= `discountPercentage` <= 100
- **Extraction confidence**: 0.0–1.0
- **Pagination**: default `page=1`, `limit=50`
- **Filtering/sorting**: applied at DB with proper indexes (GIN on `conditions`, B-tree on prices)
- **Rate limiting**: 100 requests/min per user
- **Error handling**: return standard `{ code, message, details? }`

### Business Logic Mapping
- **Automatic flyer fetch**: internal cron 2×/week invoking `POST /flyers/fetch`
- **Data extraction**: scheduled or manual via `POST /flyers/:id/extract`
- **Filtering/sorting of offers**: query params on `GET /offers`
- **Alerts**: external service listens to PostgreSQL NOTIFY on threshold breach via `/stats/parsing-errors`
