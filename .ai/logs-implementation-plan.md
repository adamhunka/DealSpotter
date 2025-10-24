# API Endpoint Implementation Plan: Logs Retrieval

## 1. Przegląd punktu końcowego
Implementacja dwóch admin-only punktów końcowych REST API do pobierania logów:

- GET /logs/extraction – zwraca logi ekstrakcji (`ExtractionLogDTO[]`).
- GET /logs/llm – zwraca logi komunikacji z LLM (`LLMLogDTO[]`).

Oba endpointy umożliwiają filtrowanie, paginację oraz zwracają metadane paginacji.

## 2. Szczegóły żądania

### GET /logs/extraction
- Metoda HTTP: GET
- URL: `/logs/extraction`
- Query parameters:
  - Wymagane:
    - `page`: number – numer strony (>=1)
    - `limit`: number – liczba rekordów na stronę (>=1)
  - Opcjonalne:
    - `flyerId`: UUID – filtr po identyfikatorze gazetki
    - `status`: string – filtr po statusie ekstrakcji (`success`, `error`, `partial`)

### GET /logs/llm
- Metoda HTTP: GET
- URL: `/logs/llm`
- Query parameters:
  - Wymagane:
    - `page`: number – numer strony (>=1)
    - `limit`: number – liczba rekordów na stronę (>=1)
  - Opcjonalne:
    - `model`: string – filtr po nazwie modelu LLM
    - `status`: string – filtr po statusie (`success`, `error`, `timeout`)

## 3. Wykorzystywane typy

- DTO:
  - `ExtractionLogDTO`
  - `LLMLogDTO`
- Command / Query Models (nowe):
  - `ExtractionLogsQueryCommand`
  - `LLMLogsQueryCommand`
- Schematy walidacji Zod:
  - `extractionLogsQuerySchema`
  - `llmLogsQuerySchema`
- Wrapper paginacji:
  - `PaginatedResponse<T>`
  - `PaginationMeta`

## 4. Szczegóły odpowiedzi

- Kod 200: `{ items: T[], pagination: PaginationMeta }`
  - `items`: tablica DTO (logów)
  - `pagination`: `{ page, limit, total }`
- Błędy:
  - 400 – nieprawidłowe parametry (walidacja)
  - 401 – brak uwierzytelnienia
  - 403 – brak roli admina
  - 500 – nieoczekiwany błąd serwera

## 5. Przepływ danych

1. Klient wysyła żądanie GET z parametrami query.
2. Astro API handler w `src/pages/api/logs/*.ts`:
   - Parsuje i waliduje query przez Zod.
   - Pobiera sesję użytkownika i sprawdza rolę `admin`.
   - Wywołuje `logService.getExtractionLogs()` lub `getLLMLogs()` z obiektami Command.
3. `logService` w `src/lib/services/logService.ts`:
   - Przygotowuje zapytanie do Supabase (tabela `extraction_logs` lub `llm_logs`), dodaje filtry i paginację.
   - Wykonuje zapytanie i mapuje wiersze na DTO.
   - Zwraca `PaginatedResponse<DTO>`.
4. Handler zwraca odpowiedź JSON z kodem 200.

## 6. Względy bezpieczeństwa

- Uwierzytelnianie: użycie Supabase Auth z `context.locals.supabase`.
- Autoryzacja: wymóg roli `admin` (sprawdzenie w JWT/raw_user_meta_data).
- RLS: tabele `extraction_logs` i `llm_logs` mają polityki odczytu tylko dla adminów.
- Walidacja wejścia: Zod chroni przed złośliwymi wartościami.
- Ochrona przed atakami parametrów: typowanie i sanitacja.

## 7. Obsługa błędów

- 400 Bad Request: nieudana walidacja query (szczegóły w ciele odpowiedzi).
- 401 Unauthorized: brak sesji użytkownika.
- 403 Forbidden: sesja istnieje, ale rola != `admin`.
- 500 Internal Server Error: nieprzewidziane wyjątki (zalogować i zwrócić ogólny komunikat).

## 8. Rozważania dotyczące wydajności

- Indeksy:
  - `idx_extraction_logs_created_at` (GIN/B-tree)
  - `idx_llm_logs_created_at`
  - Indeksy filtrów (status, model)
- Paginacja przez LIMIT/OFFSET; przy dużych wolumenach rozważyć keyset pagination.
- Caching warstwy aplikacji (np. krótkoterminowy TTL dla często odczytywanych logów).

## 9. Kroki implementacji

1. Utworzyć nowe schematy walidacji w `src/lib/schemas/log.schema.ts`.
3. Stworzyć `logService` w `src/lib/services/logService.ts` z metodami `getExtractionLogs` i `getLLMLogs`.
4. Utworzyć pliki API:
   - `src/pages/api/logs/extraction.ts`
   - `src/pages/api/logs/llm.ts`
   Implementacja handlerów z walidacją, auth i wywołaniem serwisu.
