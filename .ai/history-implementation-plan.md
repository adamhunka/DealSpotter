# API Endpoint Implementation Plan: GET /history

## 1. Przegląd punktu końcowego
Celem tego endpointu jest pobranie historii cen produktów z tabeli `price_history`, z opcją filtrowania po identyfikatorze produktu lub sklepu oraz wsparciem paginacji.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Ścieżka: `/api/history`
- Parametry zapytania:
  - Wymagane:
    - `page` (number) – numer strony, minimalnie 1
    - `limit` (number) – liczba rekordów na stronę, zakres 1–100
  - Opcjonalne:
    - `productId` (UUID) – filtr po identyfikatorze produktu
    - `storeId` (UUID) – filtr po identyfikatorze sklepu
- Brak ciała żądania (request body)

## 3. Wykorzystywane typy
- DTO: `PriceHistoryDTO` (zdefiniowany w `src/types.ts`)
- PaginatedResponse<PriceHistoryDTO> oraz `PaginationMeta`

## 4. Szczegóły odpowiedzi
- Status 200: zwraca strukturę:
  ```json
  {
    "items": [ PriceHistoryDTO ],
    "pagination": {
      "page": number,
      "limit": number,
      "total": number
    }
  }
  ```
- Kody błędów:
  - 400 – nieprawidłowe dane wejściowe (walidacja Zod)
  - 401 – brak lub nieważny token autoryzacji
  - 500 – błąd serwera lub zapytania do bazy danych

## 5. Przepływ danych
1. Handler w `src/pages/api/history.ts` otrzymuje żądanie.
2. Waliduje parametry zapytania przy użyciu schematu Zod.
3. Wywołuje `priceHistoryService.getHistory({ productId, storeId, page, limit })`.
4. W serwisie korzysta z `context.locals.supabase`:
   - Buduje zapytanie do tabeli `price_history`:
     - `.eq('product_id', productId)` jeśli przekazano
     - `.eq('store_id', storeId)` jeśli przekazano
     - `.order('valid_from', { ascending: false })`
     - `.range(offset, offset + limit - 1)` dla paginacji
     - `.limit(limit).offset((page - 1) * limit)` lub `.range`
     - Z opcją `count: 'exact'` aby uzyskać całkowitą liczbę rekordów
5. Mapuje każdy wiersz na `PriceHistoryDTO`.
6. Komponuje obiekt `PaginatedResponse` z `items` i `pagination`.
7. Zwraca odpowiedź JSON ze statusem 200.

## 6. Względy bezpieczeństwa
- Autoryzacja:
  - Jeśli endpoint wymaga uwierzytelnienia, dodaj middleware sprawdzające token i zwracające 401.
  - W przeciwnym razie RLS w Supabase pozwala na odczyt rekordów zgodnie z politykami.
- Walidacja:
  - Użyć Zod do sprawdzenia poprawności UUID i zakresów liczb.
  - Odrzucić nieprawidłowe parametry z błędem 400.

## 7. Obsługa błędów
- Błędy walidacji (Zod): zwrócić 400 z opisem problemu.
- Błędy braku autoryzacji: 401.
- Błędy zapytań do Supabase (np. `error` w odpowiedzi): zwrócić 500 i zalogować szczegóły.
- Scenariusz braku rekordów: zwrócić pustą tablicę `items` i `total: 0` przy 200.

## 8. Rozważania dotyczące wydajności
- Indeksy:
  - `idx_price_history_product_id` oraz `idx_price_history_store_id` wspierają filtrację.
  - `idx_price_history_valid_from` wspiera sortowanie.
- Ograniczyć maksymalną wartość `limit` do np. 100.
- Zwracać tylko potrzebne kolumny (wszystkie z DTO) i nie joinować zbędnych tabel.

## 9. Kroki implementacji
1. Utworzyć schemat Zod w `src/lib/schemas/history.schema.ts`:
   - Pola: `productId`, `storeId`, `page`, `limit`.
2. Dodać serwis w `src/lib/services/priceHistoryService.ts`:
   - Metoda `getHistory({ productId, storeId, page, limit })`.
3. Utworzyć endpoint w `src/pages/api/history.ts`:
   - `export const prerender = false`
   - `export async function GET({ request, locals })`:
     - Walidacja Zod
     - Wywołanie serwisu
     - Zwrócenie `new Response(JSON.stringify(response), { status: 200 })`
4. Dodać typy w `src/types.ts` (jeśli brakujące).