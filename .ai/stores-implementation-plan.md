# API Endpoint Implementation Plan: GET /stores

## 1. Przegląd punktu końcowego
Endpoint `GET /stores` umożliwia pobranie listy wszystkich sklepów z bazy danych. Zwraca prostą tablicę obiektów zawierających podstawowe dane o sklepie: identyfikator, nazwę, slug i adres URL logo.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Ścieżka: `/api/stores`
- Parametry zapytania:
  - Wymagane: brak
  - Opcjonalne: brak
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagane przez middleware uwierzytelniające)
- Body: brak

## 3. Szczegóły odpowiedzi
- Kod 200 OK
- Nagłówek `Content-Type: application/json`
- Struktura JSON:
  ```json
  [
    {
      "id": "uuid",
      "name": "string",
      "slug": "string",
      "logoUrl": "string | null"
    },
    ...
  ]
  ```
- Wykorzystywane typy (z `src/types.ts`):
  - `StoreDTO` (id, name, slug, logoUrl)
- Komenda modelu: brak (GET bez body)

## 4. Przepływ danych
1. Klient wysyła żądanie GET `/api/stores` z poprawnym tokenem.
2. Middleware Astro pobiera `supabase` z `context.locals` i weryfikuje token użytkownika.
3. Kontroler w `src/pages/api/stores.ts` wywołuje usługę `storeService.list()`.
4. `storeService.list()` używa Supabase Client:
   ```ts
   const { data, error } = await supabase
     .from('stores')
     .select('id,name,slug,logo_url')
     .order('name', { ascending: true });
   ```
5. W przypadku błędu zapisu (error) wyrzucamy wyjątek, który przechwytuje globalny handler.
6. Wyniki mapujemy na `StoreDTO`:
   ```ts
   return data.map(({ id, name, slug, logo_url }) => ({ id, name, slug, logoUrl: logo_url }));
   ```
7. Kontroler zwraca `new Response(JSON.stringify(items), { status: 200 })`.

## 5. Względy bezpieczeństwa
- Uwierzytelnianie: wymagana autoryzacja przez middleware Supabase Auth.
- Autoryzacja: RLS w Supabase pozwala każdemu uwierzytelnionemu użytkownikowi na SELECT z tabeli `stores` (polityka `Allow public read access to stores`).
- Walidacja: brak parametrów wejściowych, ale jeśli pojawią się, odrzucamy z 400.
- Unikamy ujawniania dodatkowych pól (mapowanie do DTO ogranicza zwracane dane).

## 6. Obsługa błędów
- 400 Bad Request: nietypowe parametry query (np. jakiekolwiek query params) ➔ Response z treścią `{ error: 'No query parameters expected.' }`.
- 401 Unauthorized: brak lub nieważny token ➔ globalny handler middleware zwraca 401.
- 500 Internal Server Error: błąd połączenia z bazą lub wewnętrzny błąd serwera ➔ logowanie `console.error(error)` i Response `{ error: 'Internal server error.' }`.

## 7. Rozważania dotyczące wydajności
- Indeks `idx_stores_slug` zapewnia szybkie filtrowanie po slug (choć nieużywane w tym endpointzie).
- Drzewo B-tree na `name` umożliwia szybkie sortowanie.
- Możliwość wprowadzenia cache (Redis lub CDN) dla często pobieranej listy sklepów.
- Ograniczona liczba rekordów (kilkadziesiąt sklepów) nie wymaga paginacji.

## 8. Kroki implementacji
1. Utworzyć plik `src/pages/api/stores.ts`.
2. Zaimportować `supabase` z `context.locals` i `StoreDTO` z `src/types.ts`.
3. Zaimplementować handler `export const GET`:
   - Sprawdzić brak query params.
   - Wywołać `storeService.list()`.
   - Mapować wynik do DTO.
   - Zwrócić Response JSON z kodem 200.
4. Utworzyć serwis `src/lib/services/store.ts` (jeśli nie istnieje) z metodą `list()`:
   - Zapytanie do Supabase.
   - Obsługa błędów.
5. Dodać globalny middleware uwierzytelniający w `src/middleware/index.ts`, jeśli brak.
6. Napisać test jednostkowy/mocking Supabase:
   - `GET /api/stores` zwraca listę przykładowych sklepów.
   - 400 przy query params.
7. Zaktualizować dokumentację OpenAPI/spec w `.ai/api-plan.md`.
8. Przejrzeć linty i upewnić się, że nie ma błędów.
9. Przeprowadzić code review i zmergować implementację.
