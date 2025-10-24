# API Endpoint Implementation Plan: Flyers

## 1. Przegląd punktu końcowego
Zestaw endpointów REST do obsługi zasobu „flyers”:
- GET /flyers – pobranie listy gazetek z opcjonalnym filtrowaniem i paginacją
- GET /flyers/:id – pobranie szczegółów pojedynczej gazetki
- POST /flyers/fetch – wymuszone pobranie najnowszych plików PDF (tylko admin)
- POST /flyers/:id/extract – wymuszenie ekstrakcji treści jednej gazetki (tylko admin)

## 2. Szczegóły żądania

### GET /flyers
- Metoda: GETF
- URL: `/api/flyers`
- Parametry query:
  - Wymagane: brak
  - Opcjonalne:
    - `storeId` (UUID) – filtrowanie po identyfikatorze sklepu
    - `valid` (boolean) – tylko aktualne promocje (`validFrom <= today <= validTo`)
    - `page` (number, >=1) – numer strony (domyślnie 1)
    - `limit` (number, >=1, <=100) – ilość elementów na stronę (domyślnie 20)
- Body: brak

### GET /flyers/:id
- Metoda: GET
- URL: `/api/flyers/:id`
- Parametry:
  - Path param `id` (UUID)
- Body: brak

### POST /flyers/fetch
- Metoda: POST
- URL: `/api/flyers/fetch`
- Ochrona: tylko użytkownicy z rolą `admin`
- Body: `{}` (FetchFlyersCommand)

### POST /flyers/:id/extract
- Metoda: POST
- URL: `/api/flyers/:id/extract`
- Ochrona: tylko użytkownicy z rolą `admin`
- Path param `id` (UUID)
- Body: `{ flyerId: string }` (ExtractFlyerCommand)

## 3. Wykorzystywane typy
- DTO:
  - `FlyerDTO` – struktura odpowiedzi pojedynczej gazetki
  - `PaginatedResponse<FlyerDTO>` + `PaginationMeta` – odpowiedź dla listy
  - `JobResponseDTO` – `{ jobId: string }`
- Command Modele:
  - `FetchFlyersCommand` (Record<string, never>)
  - `ExtractFlyerCommand` `{ flyerId: string }`

## 4. Przepływ danych
1. Klient wysyła żądanie do Astro API route w `src/pages/api/flyers/*`.
2. Handler odczytuje i waliduje parametry za pomocą Zod.
3. Handler wywołuje metody w `src/lib/services/flyer.service.ts`:
   - `listFlyers(filter, page, limit)`
   - `getFlyerById(id)`
   - `triggerFetchFlyers()`
   - `triggerExtractFlyer(id)`
4. Service używa `context.locals.supabase` do zapytań do bazy (Supabase-js).
5. Service zwraca dane do handlera, handler mapuje je na DTO.
6. Handler zwraca odpowiedź JSON z odpowiednim kodem stanu.

## 5. Względy bezpieczeństwa
- Uwierzytelnianie: pobranie sesji Supabase w `context.locals.supabase.auth.getSession()`.
- Autoryzacja:
  - GET – dostęp dla wszystkich zalogowanych (`authenticated`).
  - POST – tylko `admin` (sprawdzenie `raw_user_meta_data.role === 'admin'`).
- RLS: Supabase publiczna polityka SELECT dla `flyers`, ale POST przebiega przez service_role lub weryfikację roli.

## 6. Obsługa błędów
- 400 Bad Request – niepoprawne parametry (walidacja Zod). Zwrócić strukturę `{ error: string, details?: any }`.
- 401 Unauthorized – brak sesji lub niewłaściwa rola przy POST.
- 404 Not Found – żądana gazetka nie istnieje.
- 500 Internal Server Error – błąd po stronie serwera; logować `console.error(err)` i zwrócić `{ error: 'Internal server error' }`.

## 7. Wydajność
- Paginacja z limitem i offsetem w zapytaniach SQL.
- Indeksy na kolumnach `store_id`, `valid_from`, `valid_to`, `issue_date` (wg planu DB).
- Cache (opcjonalnie) przy GET listy, np. w Redis.

## 8. Kroki implementacji
1. Utworzyć plik `src/lib/services/flyer.service.ts` z czterema metodami (list, get, fetch, extract).
2. Utworzyć Zod schemas w `src/lib/schemas/flyer.schema.ts`.
3. Dodać API routes:
   - `src/pages/api/flyers/index.ts` (GET /flyers, POST /flyers/fetch)
   - `src/pages/api/flyers/[id].ts` (GET /:id, POST /:id/extract)
4. W każdym handlerze: zaimportować schema, supabase z `context.locals`, wykonać walidację, autoryzację, wywołać metodę service.
5. Mapować wynik na DTO (`src/types.ts`) i zwrócić odpowiedź z właściwym kodem.