# API Endpoint Implementation Plan: Parsing Error Stats

## 1. Przegląd punktu końcowego
Endpoint GET `/stats/parsing-errors` zwraca tygodniowe wskaźniki błędów parsowania z materializowanego widoku `parsing_error_stats`.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Ścieżka URL: `/stats/parsing-errors`
- Parametry:
  - Wymagane: brak
  - Opcjonalne: brak (ew. w przyszłości paginacja)
- Request Body: brak

## 3. Wykorzystywane typy
- DTO: `ParsingErrorStatDTO` (z `src/types.ts`):
  - `weekStart: string`
  - `storeId: string`
  - `errorRate: number`
  - `total: number`

## 4. Szczegóły odpowiedzi
- Kod statusu: 200 OK
- Treść odpowiedzi: tablica obiektów typu `ParsingErrorStatDTO`:
  ```json
  [
    { "weekStart": "2025-10-13T00:00:00Z", "storeId": "uuid", "errorRate": 2.5, "total": 200 },
    ...
  ]
  ```

## 5. Przepływ danych
1. W handlerze Astro (w `src/pages/api/stats/parsing-errors.ts`) pobieramy `supabase` z `context.locals`.
2. Wywołujemy serwis `statsService.getParsingErrorStats()`.
3. Serwis wykonuje zapytanie:
   ```ts
   supabase.from('parsing_error_stats').select('week_start, store_id, error_rate_percentage, total_extractions')
   ```
4. Mapujemy wynik na `ParsingErrorStatDTO`:
   - `weekStart = week_start`
   - `storeId = store_id`
   - `errorRate = error_rate_percentage`
   - `total = total_extractions`
5. Zwracamy odpowiedź JSON z kodem 200.

## 6. Względy bezpieczeństwa
- Uwierzytelnienie: wymaga autoryzacji JWT (middleware w `src/middleware/index.ts`).
- Autoryzacja: wymóg roli `admin` (sprawdzenie w JWT/raw_user_meta_data).
- Zapobiegamy SQL Injection przez użycie SDK Supabase.

## 7. Obsługa błędów
- 401 Unauthorized: brak lub nieważny token.
- 500 Internal Server Error: błąd zapytania do bazy lub nieoczekiwany wyjątek.
- Wszystkie nieobsłużone wyjątki logujemy za pomocą loggera (`src/lib/logger`).

## 8. Rozważania dotyczące wydajności
- Widok materializowany `parsing_error_stats` odświeżany w cron (minimalizuje koszt zapytań).
- Indeks na `(week_start, store_id)` zapewnia szybkie filtrowanie.
- W przyszłości można dodać paginację lub cache w warstwie API.

## 9. Kroki implementacji
1. Utworzyć serwis `statsService` w `src/lib/services/stats.service.ts`, implementujący `getParsingErrorStats()`.
2. Dodać plik API handlera `src/pages/api/stats/parsing-errors.ts`:
   - Importować `supabase` z `context.locals` i `statsService`.
   - Wywołać serwis, zwrócić wynik.
3. Zadeklarować DTO `ParsingErrorStatDTO` (już w `src/types.ts`).
4. Skonfigurować middleware uwierzytelniające w `src/middleware/index.ts` na ścieżce `/stats/*`.
