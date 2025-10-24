# API Endpoint Implementation Plan: Products

## 1. Przegląd punktu końcowego
Ten plan obejmuje dwa punktu końcowe REST API dla zasobu produktów:
- GET `/products`: wyszukiwanie i paginacja produktów
- GET `/products/:id`: pobranie szczegółów pojedynczego produktu

## 2. Szczegóły żądania

### 2.1 GET /products
- Metoda HTTP: GET
- URL: `/products`
- Parametry zapytania (query):
  - Wymagane: brak
  - Opcjonalne:
    - `q` (string) – fraza wyszukiwania pełnotekstowego
    - `categoryId` (UUID) – filtracja po identyfikatorze kategorii
    - `page` (number) – numer strony (domyślnie 1)
    - `limit` (number) – liczba elementów na stronę (domyślnie 20, max 100)

### 2.2 GET /products/:id
- Metoda HTTP: GET
- URL: `/products/:id`
- Parametry ścieżki (path):
  - `id` (UUID) – identyfikator produktu

## 3. Wykorzystywane typy
- `ProductDTO` – definicja produktu (z `src/types.ts`)
- `PaginatedResponse<ProductDTO>` – wrapper paginacji z polami `items` i `pagination`
- `PaginationMeta` – meta dane paginacji (`page`, `limit`, `total`)

## 4. Szczegóły odpowiedzi

### 4.1 GET /products
- Status: 200 OK
- Body:
  ```json
  {
    "items": [ProductDTO],
    "pagination": {
      "page": number,
      "limit": number,
      "total": number
    }
  }
  ```

### 4.2 GET /products/:id
- Statusy:
  - 200 OK: zwrócono `ProductDTO`
  - 404 Not Found: brak produktu o podanym `id`

## 5. Przepływ danych
1. **Walidacja zapytania**: użycie Zod schema w handlerze do walidacji typów i zakresów (UUID, page, limit)
2. **Wywołanie serwisu**:
   - `productService.search(q, categoryId, page, limit)` → pobranie listy wierszy z bazy
   - `productService.getById(id)` → pobranie jednego wiersza
3. **Mapowanie**: przekształcenie wierszy z Supabase do `ProductDTO` i konstrukcja obiektu paginacji
4. **Odpowiedź**: zwrócenie JSON z poprawnym kodem statusu

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: publiczny dostęp, brak wymaganych nagłówków auth
- Autoryzacja: SELECT RLS w Supabase pozwala na publiczny odczyt tabeli `products`
- Sanitizacja: zapytania parametryzowane przez SDK Supabase zapobiegają SQL Injection
- Ograniczenie wielkości `limit` (max 100) w walidacji

## 7. Obsługa błędów
- 400 Bad Request: niepoprawne parametry (zła składnia UUID, zakresy page/limit)
- 404 Not Found: produkt o danym `id` nie istnieje
- 500 Internal Server Error: nieoczekiwane błędy serwera lub bazy danych

## 8. Rozważania dotyczące wydajności
- Użycie indeksów GIN na `search_vector` do pełnotekstowego wyszukiwania
- Indeks na `category_id` do szybkiego filtrowania
- Ograniczenie `limit` i stronicowanie po `offset` lub rozważenie kursora
- Cache-owanie na poziomie CDN lub warstwy aplikacji, jeśli konieczne

## 9. Kroki implementacji
1. Utworzyć pliki handlerów:
   - `src/pages/api/products/index.ts`
   - `src/pages/api/products/[id].ts`
2. Zdefiniować Zod schematy requestów i odpowiedzi w `src/lib/schemas` (np. `product.schema.ts`)
3. Rozszerzyć lub utworzyć `product.service.ts` w `src/lib/services` z metodami:
   - `search(q, categoryId, page, limit)`
   - `getById(id)`
4. W handlerach użyć `context.locals.supabase` do wykonywania zapytań
5. Mapowanie wierszy do DTO w warstwie serwisu lub helperze mapującym
6. Przeprowadzić code review
