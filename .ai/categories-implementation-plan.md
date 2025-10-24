# API Endpoint Implementation Plan: GET /categories

## 1. Przegląd punktu końcowego
Endpoint `GET /categories` zwraca pełną listę dostępnych kategorii produktów. Służy do ładowania widocznych dla użytkownika sekcji kategorii w aplikacji.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Ścieżka URL: `/categories`
- Parametry:
  - Wymagane: brak
  - Opcjonalne: brak
- Request Body: brak

## 3. Wykorzystywane typy
- `CategoryDTO` (zdefiniowany w `src/types.ts`):
  ```ts
  interface CategoryDTO {
    id: string;
    name: string;
    slug: string;
  }
  ```

## 4. Szczegóły odpowiedzi
- Kod statusu 200:
  ```json
  [
    { "id": "UUID", "name": "Nazwa kategorii", "slug": "slug-kategorii" },
    ...
  ]
  ```
- Kod statusu 401: brak autoryzacji (jeśli RLS wymaga uwierzytelnienia)
- Kod statusu 500: błąd wewnętrzny serwera

## 5. Przepływ danych
1. Klient wysyła `GET /categories`.
2. Middleware Astro inicjalizuje obiekt Supabase w `context.locals`.
3. Metoda `GET` w pliku `src/pages/api/categories/index.ts` wywołuje `CategoryService.getAll()`.
4. `CategoryService.getAll()` używa `context.locals.supabase` (service role) i wykonuje `select('id,name,slug')` na tabeli `categories`.
5. Wynik zapytania mapowany jest na tablicę `CategoryDTO`.
6. Handler zwraca odpowiedź JSON z listą kategorii i kodem 200.

## 6. Względy bezpieczeństwa
- RLS: tabela `categories` ma policy „Allow public read access to categories” – dozwolony odczyt dla wszystkich uwierzytelnionych użytkowników.
- Uwierzytelnienie: użyć klucza service_role lub public key w zależności od wymagań endpointu.
- SQL Injection: zapytanie poprzez Supabase SDK gwarantuje bezpieczne prepared statements.
- Brak parametrów wejściowych – niepotrzebna dodatkowa walidacja.

## 7. Obsługa błędów
- Brak rekordów: zwrócić pustą tablicę i 200.
- Błąd połączenia z bazą / wyjątek Supabase:
  - Zalogować szczegóły błędu (np. do `llm_logs` lub dedykowanego systemu logowania).
  - Zwrócić `{ error: 'Internal server error' }` z kodem 500.
- Nieautoryzowany dostęp (jeśli wdrożono check RLS): zwrócić 401.

## 8. Rozważania dotyczące wydajności
- Indeks na kolumnie `slug` oraz ewentualne sortowanie wg `display_order`.
- Możliwość cachowania odpowiedzi po stronie serwera lub CDN (jeśli zmiana kategorii jest rzadka).
- Brak paginacji – przewidywana niewielka liczba kategorii.

## 9. Kroki implementacji
1. Utworzyć lub zaktualizować serwis w `src/lib/services/category.service.ts`:
   - Metoda `getAll(): Promise<CategoryDTO[]>`.
2. Dodać handler Astro w `src/pages/api/categories/index.ts`:
   - `export const GET` korzystający z `CategoryService.getAll()`.
3. Przejrzeć implementację pod kątem lintera i naprawić ostrzeżenia.
