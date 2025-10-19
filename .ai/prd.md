# Dokument wymagań produktu (PRD) - DealSpotter
## 1. Przegląd produktu
DealSpotter to aplikacja adresowana do rodzin i emerytów, umożliwiająca zbieranie i prezentację informacji o produktach w cenach promocyjnych z gazetek Biedronka i Lidl. MVP zapewnia bezpieczną autoryzację, cykliczne pobieranie PDF-ów, ekstrakcję danych oraz wyświetlanie wyników z filtrowaniem i sortowaniem.

## 2. Problem użytkownika
Obecnie rodziny i emeryci muszą przeglądać wiele papierowych i internetowych gazetek, aby znaleźć najlepsze promocje, co jest czasochłonne i podatne na pominięcia. Brakuje scentralizowanego narzędzia, które automatycznie zbierałoby i prezentowało aktualne oferty.

## 3. Wymagania funkcjonalne
1. Autoryzacja
   - US-001: Rejestracja email/hasło z weryfikacją konta przez link aktywacyjny
   - US-002: Logowanie email/hasło; bezpieczna sesja użytkownika
   - US-003: Reset hasła na podstawie adresu email
2. Pobieranie gazetek
   - cykliczne (2×/tydzień) pobieranie PDF-ów z gazetek Biedronka i Lidl
   - obsługa formatu PDF
3. Ekstrakcja danych
   - parsowanie PDF → produkty, cena promocyjna, warunki promocji
   - monitorowanie dokładności ekstrakcji (KPI ≥ 90%)
   - ręczna walidacja losowych próbek (min. 50 produktów/miesiąc)
4. Prezentacja danych
   - lista produktów z filtrowaniem po kategorii i po sklepie
   - sortowanie malejąco po cenie promocyjnej
   - paginacja lub lazy loading dla wydajności
5. Monitorowanie i alertowanie
   - alert przy > 5% błędów parsowania w tygodniu (powiadomienie dla zespołu DevOps)
6. Logowanie komunikacji z LLM
   - zapis zapytań i odpowiedzi z timestam­pem w dedykowanej tabeli Supabase
   - retencja logów 90 dni, automatyczna rotacja
7. Wydajność
   - średni czas odpowiedzi API < 500 ms
   - czas renderowania listy 50 produktów < 2 s
8. Infrastruktura i CI/CD
   - Supabase (Postgres) jako baza danych
   - Astro 5 + React 19 + Tailwind 4 + Shadcn/ui
   - automatyczne testy, staging i produkcja

## 4. Granice produktu
- Profilowanie użytkowników i powiadomienia push/email poza zakresem MVP
- Obsługa formatów innych niż PDF (obrazy, HTML) planowana w kolejnych iteracjach
- Integracja OAuth i inne mechanizmy uwierzytelniania zewnętrznego w przyszłości
- Rozbudowana taksonomia kategorii i automatyczne mapowanie poza MVP

## 5. Historyjki użytkowników
- ID: US-001
  Tytuł: Rejestracja nowego użytkownika
  Opis: Jako nowy użytkownik chcę założyć konto za pomocą emaila i hasła, aby uzyskać dostęp do aplikacji.
  Kryteria akceptacji:
    - formularz rejestracji zawiera pola email i hasło
    - po wysłaniu formularza użytkownik otrzymuje link aktywacyjny na email
    - kliknięcie linku aktywuje konto i przekierowuje do ekranu logowania

- ID: US-002
  Tytuł: Logowanie użytkownika
  Opis: Jako zarejestrowany użytkownik chcę się zalogować za pomocą emaila i hasła, aby uzyskać dostęp do prywatnej części aplikacji.
  Kryteria akceptacji:
    - formularz logowania zawiera pola email i hasło
    - nieprawidłowe dane wyświetlają komunikat o błędzie
    - poprawne dane tworzą bezpieczną sesję użytkownika

- ID: US-003
  Tytuł: Reset hasła
  Opis: Jako użytkownik, który zapomniał hasła, chcę otrzymać email z instrukcjami resetu, aby odzyskać dostęp do konta.
  Kryteria akceptacji:
    - formularz umożliwia podanie emaila
    - wysłanie formularza generuje jednorazowy link resetu ważny 24h
    - kliknięcie linku umożliwia ustawienie nowego hasła

- ID: US-004
  Tytuł: Automatyczne pobieranie gazetek
  Opis: Jako użytkownik chcę, aby system co tydzień automatycznie pobierał aktualne PDF-y gazetek Biedronka i Lidl.
  Kryteria akceptacji:
    - zadanie cron uruchamia pobieranie 2×/tydzień
    - wszystkie PDF-y są zapisywane w repozytorium danych
    - błędy pobierania są logowane i wyzwalają alert, jeśli > 5% operacji nie powiedzie się

- ID: US-005
  Tytuł: Ekstrakcja informacji z PDF
  Opis: Jako użytkownik chcę, aby system parsował pobrane PDF-y, wyodrębniając produkty, ceny promocyjne i warunki promocji.
  Kryteria akceptacji:
    - ekstrakcja zwraca listę produktów z nazwą, ceną promocyjną i opisem warunków
    - dokładność ekstrakcji ≥ 90%, monitorowane automatycznie

- ID: US-006
  Tytuł: Przeglądanie ofert promocyjnych
  Opis: Jako użytkownik chcę przeglądać listę wyodrębnionych produktów, aby zobaczyć dostępne promocje.
  Kryteria akceptacji:
    - lista zawiera nazwy produktów, ceny i sklep
    - widok jest responsywny i czytelny na ekranach desktop i mobile

- ID: US-007
  Tytuł: Filtrowanie ofert
  Opis: Jako użytkownik chcę filtrować listę po kategorii i sklepie, aby szybciej znaleźć interesujące promocje.
  Kryteria akceptacji:
    - dostępne filtry: kategoria, sklep
    - zastosowanie filtra odświeża listę bez przeładowania strony

- ID: US-008
  Tytuł: Sortowanie wyników
  Opis: Jako użytkownik chcę sortować listę malejąco po cenie promocyjnej, aby najdroższe promocje pojawiały się na górze.
  Kryteria akceptacji:
    - opcja sortowania dostępna w interfejsie
    - lista aktualizuje się natychmiast po wybraniu sortowania

- ID: US-009
  Tytuł: Przeglądanie logów LLM
  Opis: Jako administrator chcę mieć dostęp do logów zapytań i odpowiedzi LLM, aby przeprowadzać audyt i debugowanie.
  Kryteria akceptacji:
    - strona administracyjna wyświetla zapytania, odpowiedzi i timestamp
    - logi są dostępne przez 90 dni od utworzenia

- ID: US-010
  Tytuł: Alerty błędów ekstrakcji
  Opis: Jako zespół DevOps chcę otrzymywać powiadomienia, gdy odsetek błędów parsowania przekroczy 5% w tygodniu.
  Kryteria akceptacji:
    - monitorowanie błędów agreguje wskaźnik tygodniowy
    - alert wysyłany na kanał Slack/email przy przekroczeniu progu

## 6. Metryki sukcesu
- dokładność ekstrakcji ≥ 90% (automatyczne monitorowanie + ręczna walidacja)
- średni czas odpowiedzi API < 500 ms
- czas renderowania listy 50 produktów < 2 s
- odsetek błędów parsowania < 5% tygodniowo
- dostępność systemu > 99% w ciągu miesiąca
