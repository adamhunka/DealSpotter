# API Endpoint Implementation Plan: Product Offers  

## ✅ STATUS: COMPLETED (2025-10-23)

## 1. Przegląd punktu końcowego  
Implementacja dwóch publicznych punktów końcowych REST API:  
- GET `/offers` — zwraca listę ofert promocyjnych z paginacją, filtrowaniem i sortowaniem.  
- GET `/offers/:id` — zwraca szczegóły pojedynczej oferty na podstawie UUID.  

## 2. Szczegóły żądania  

### 2.1 GET /offers  
- Metoda HTTP: GET  
- URL: `/api/offers`  
- Query Parameters:  
  - Wymagane: brak  
  - Opcjonalne:  
    - `storeId` (UUID) — filtr po sklepie  
    - `categoryId` (UUID) — filtr po kategorii  
    - `sort` (enum) — kierunek sortowania, domyślnie `promoPrice_desc`  
    - `page` (number, ≥1) — numer strony, domyślnie 1  
    - `limit` (number, ≥1, ≤100) — liczba elementów na stronę, domyślnie 20  
- Request Body: brak  

### 2.2 GET /offers/:id  
- Metoda HTTP: GET  
- URL: `/api/offers/[id]`  
- Path Parameter:  
  - `id` (UUID) — identyfikator oferty  
- Query/Body: brak  

## 3. Wykorzystywane typy  
- `OfferDTO` (src/types.ts): typ odpowiedzi  
- `PaginatedResponse<OfferDTO>` + `PaginationMeta`  
- Zod schema w ścieżkach:  
  - `ListOffersQuerySchema` (storeId, categoryId, sort, page, limit)  
  - `OfferIdParamSchema` (id)  

## 4. Szczegóły odpowiedzi  

### 4.1 GET /offers  
- 200 OK  
```json
{
  "items": [OfferDTO, ...],
  "pagination": { "page": number, "limit": number, "total": number }
}
```  

### 4.2 GET /offers/:id  
- 200 OK: `OfferDTO`  
- 404 Not Found: `{ "error": "Offer not found" }`  

## 5. Przepływ danych  
1. **Walidacja**: parse & validate query/path via Zod  
2. **Service**:  
   - `OfferService.list(...)` → zapytanie do Supabase  
   - `OfferService.getById(id)`  
3. **Mapowanie**: mapowanie wierszy DB na `OfferDTO`  
4. **Response**: zwrócenie JSON z kodem statusu  

## 6. Względy bezpieczeństwa  
- Publiczny dostęp (RLS Supabase zezwala na SELECT w `product_offers`).  
- Walidacja parametrów zapobiega SQL injection.  
- Brak wrażliwych danych w odpowiedzi.  

## 7. Obsługa błędów  
- 400 Bad Request: błędne query/path (Zod)  
- 404 Not Found: GET /offers/:id gdy brak rekordu  
- 500 Internal Server Error: błąd serwisu/DB  
- Logowanie błędów na serwerze przez `console.error` lub dedykowany logger  

## 8. Rozważania dotyczące wydajności  
- Indeksy w tabeli `product_offers`: idx_product_offers_flyer_id, idx_product_offers_product_id, idx_product_offers_valid_dates, idx_product_offers_promo_price_desc  
- Paginacja z użyciem `range` zamiast `limit-offset` dużych wartości  
- Ewentualne cache’owanie często pobieranych stron 

## 9. Kroki implementacji  
1. **Stworzyć Zod schemas** w `src/lib/schemas/offer.schema.ts`: `ListOffersQuerySchema`, `OfferIdParamSchema`.  
2. **Utworzyć OfferService** (`src/lib/services/offer.service.ts`) z metodami `list` i `getById`.  
3. **Utworzyć endpoint GET /offers** (`src/pages/api/offers/index.ts`):  
   - Parsowanie query, walidacja  
   - Wywołanie `OfferService.list`  
   - Return 200 z paginated JSON  
4. **Utworzyć endpoint GET /offers/[id].ts**:  
   - Parsowanie path param, walidacja  
   - `OfferService.getById`  
   - Return 200 lub 404   