# Schemat Bazy Danych - DealSpotter MVP

## 1. Tabele

### 1.1. stores
Sklepy dyskontowe (Biedronka, Lidl).

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identyfikator sklepu |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Nazwa sklepu (np. "Biedronka", "Lidl") |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | Slug dla URL (np. "biedronka", "lidl") |
| logo_url | TEXT | NULL | URL do logo sklepu |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data utworzenia rekordu |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data ostatniej aktualizacji |

### 1.2. flyers
Gazetki promocyjne pobierane z poszczególnych sklepów.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identyfikator gazetki |
| store_id | UUID | NOT NULL, FK → stores(id) ON DELETE RESTRICT | Sklep, którego dotyczy gazetka |
| issue_date | DATE | NOT NULL | Data wydania gazetki |
| valid_from | DATE | NOT NULL | Data rozpoczęcia promocji |
| valid_to | DATE | NOT NULL | Data zakończenia promocji |
| source_url | TEXT | NULL | URL źródłowy PDF gazetki |
| extraction_status | VARCHAR(50) | NOT NULL, DEFAULT 'pending' | Status ekstrakcji (pending, in_progress, completed, failed) |
| extraction_completed_at | TIMESTAMPTZ | NULL | Data zakończenia ekstrakcji |
| error_count | INTEGER | NOT NULL, DEFAULT 0 | Liczba błędów podczas ekstrakcji |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data utworzenia rekordu |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data ostatniej aktualizacji |

**Ograniczenia:**
- UNIQUE(store_id, issue_date)
- CHECK(valid_from <= valid_to)
- CHECK(extraction_status IN ('pending', 'in_progress', 'completed', 'failed'))

### 1.3. categories
Kategorie produktów (płaska struktura bez hierarchii).

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identyfikator kategorii |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Nazwa kategorii (np. "Nabiał", "Pieczywo") |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | Slug dla URL |
| icon | VARCHAR(50) | NULL | Nazwa ikony (opcjonalnie) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data utworzenia rekordu |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data ostatniej aktualizacji |

### 1.4. products
Produkty (bez cen, stanowią bazę danych produktów).

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identyfikator produktu |
| name | VARCHAR(255) | NOT NULL | Nazwa produktu |
| normalized_name | VARCHAR(255) | NOT NULL | Znormalizowana nazwa (lowercase, bez znaków specjalnych) |
| category_id | UUID | NULL, FK → categories(id) ON DELETE RESTRICT | Kategoria produktu |
| brand | VARCHAR(100) | NULL | Marka produktu |
| unit | VARCHAR(50) | NULL | Jednostka (np. "szt", "kg", "l") |
| description | TEXT | NULL | Opis produktu |
| image_url | TEXT | NULL | URL do zdjęcia produktu |
| search_vector | TSVECTOR | GENERATED ALWAYS AS (to_tsvector('polish', COALESCE(name, '') \|\| ' ' \|\| COALESCE(brand, '') \|\| ' ' \|\| COALESCE(description, ''))) STORED | Wektor do full-text search |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data utworzenia rekordu |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data ostatniej aktualizacji |

**Ograniczenia:**
- UNIQUE(normalized_name, brand)

### 1.5. product_offers
Oferty promocyjne produktów z konkretnych gazetek.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identyfikator oferty |
| flyer_id | UUID | NOT NULL, FK → flyers(id) ON DELETE CASCADE | Gazetka, z której pochodzi oferta |
| product_id | UUID | NOT NULL, FK → products(id) ON DELETE RESTRICT | Produkt objęty promocją |
| promo_price | DECIMAL(10,2) | NOT NULL | Cena promocyjna |
| regular_price | DECIMAL(10,2) | NULL | Cena regularna (przed promocją) |
| discount_percentage | DECIMAL(5,2) | NULL | Procent rabatu |
| conditions | JSONB | NULL | Warunki promocji (np. {"min_quantity": 2, "loyalty_card": true}) |
| valid_from | DATE | NOT NULL | Data rozpoczęcia promocji |
| valid_to | DATE | NOT NULL | Data zakończenia promocji |
| page_number | INTEGER | NULL | Numer strony w gazetce |
| extraction_confidence | DECIMAL(5,4) | NULL | Pewność ekstrakcji (0.0-1.0) |
| manually_verified | BOOLEAN | NOT NULL, DEFAULT FALSE | Czy oferta została ręcznie zweryfikowana |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data utworzenia rekordu |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data ostatniej aktualizacji |

**Ograniczenia:**
- UNIQUE(flyer_id, product_id)
- CHECK(promo_price > 0)
- CHECK(regular_price IS NULL OR regular_price >= promo_price)
- CHECK(discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100))
- CHECK(valid_from <= valid_to)
- CHECK(extraction_confidence IS NULL OR (extraction_confidence >= 0 AND extraction_confidence <= 1))

### 1.6. price_history
Historia cen produktów (opcjonalna tabela dla śledzenia zmian cen w czasie).

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identyfikator rekordu historii |
| product_id | UUID | NOT NULL, FK → products(id) ON DELETE CASCADE | Produkt |
| store_id | UUID | NOT NULL, FK → stores(id) ON DELETE CASCADE | Sklep |
| price | DECIMAL(10,2) | NOT NULL | Cena |
| price_type | VARCHAR(20) | NOT NULL | Typ ceny (promo, regular) |
| valid_from | DATE | NOT NULL | Data rozpoczęcia obowiązywania ceny |
| valid_to | DATE | NULL | Data zakończenia obowiązywania ceny |
| source_offer_id | UUID | NULL, FK → product_offers(id) ON DELETE SET NULL | Oferta źródłowa |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data utworzenia rekordu |

**Ograniczenia:**
- CHECK(price > 0)
- CHECK(price_type IN ('promo', 'regular'))
- CHECK(valid_to IS NULL OR valid_from <= valid_to)

### 1.7. extraction_logs
Logi procesów ekstrakcji danych z gazetek (retencja 90 dni).

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identyfikator logu |
| flyer_id | UUID | NOT NULL, FK → flyers(id) ON DELETE CASCADE | Gazetka |
| product_offer_id | UUID | NULL, FK → product_offers(id) ON DELETE SET NULL | Oferta produktu (jeśli dotyczy) |
| extraction_type | VARCHAR(50) | NOT NULL | Typ ekstrakcji (full_pdf, page, product) |
| status | VARCHAR(50) | NOT NULL | Status (success, error, partial) |
| error_message | TEXT | NULL | Komunikat błędu |
| metadata | JSONB | NULL | Dodatkowe metadane (np. czas trwania, użyty model) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data utworzenia logu |

**Ograniczenia:**
- CHECK(extraction_type IN ('full_pdf', 'page', 'product'))
- CHECK(status IN ('success', 'error', 'partial'))

### 1.8. llm_logs
Logi komunikacji z modelami LLM przez OpenRouter (retencja 90 dni).

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identyfikator logu |
| flyer_id | UUID | NULL, FK → flyers(id) ON DELETE SET NULL | Gazetka (jeśli dotyczy) |
| product_offer_id | UUID | NULL, FK → product_offers(id) ON DELETE SET NULL | Oferta produktu (jeśli dotyczy) |
| model | VARCHAR(100) | NOT NULL | Nazwa użytego modelu (np. "gpt-4o", "claude-3-opus") |
| request | JSONB | NOT NULL | Zapytanie wysłane do LLM |
| response | JSONB | NOT NULL | Odpowiedź z LLM |
| tokens_input | INTEGER | NULL | Liczba tokenów wejściowych |
| tokens_output | INTEGER | NULL | Liczba tokenów wyjściowych |
| cost_usd | DECIMAL(10,6) | NULL | Koszt zapytania w USD |
| duration_ms | INTEGER | NULL | Czas trwania zapytania w ms |
| status | VARCHAR(50) | NOT NULL | Status (success, error, timeout) |
| error_message | TEXT | NULL | Komunikat błędu |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data utworzenia logu |

**Ograniczenia:**
- CHECK(status IN ('success', 'error', 'timeout'))
- CHECK(tokens_input IS NULL OR tokens_input >= 0)
- CHECK(tokens_output IS NULL OR tokens_output >= 0)
- CHECK(cost_usd IS NULL OR cost_usd >= 0)
- CHECK(duration_ms IS NULL OR duration_ms >= 0)

### 1.9. audit_logs
Logi audytowe zmian w krytycznych tabelach.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identyfikator logu audytowego |
| table_name | VARCHAR(100) | NOT NULL | Nazwa tabeli |
| record_id | UUID | NOT NULL | ID zmienionego rekordu |
| operation | VARCHAR(20) | NOT NULL | Operacja (INSERT, UPDATE, DELETE) |
| old_values | JSONB | NULL | Stare wartości (dla UPDATE/DELETE) |
| new_values | JSONB | NULL | Nowe wartości (dla INSERT/UPDATE) |
| changed_by | UUID | NULL | ID użytkownika (z auth.users) |
| changed_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data zmiany |
| metadata | JSONB | NULL | Dodatkowe metadane |

**Ograniczenia:**
- CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE'))

## 2. Relacje między tabelami

### 2.1. Diagram relacji

```
stores (1) ──< flyers (N)
              └──< product_offers (N)
                   ├──< extraction_logs (N)
                   ├──< llm_logs (N)
                   └──> products (N:1)
                        ├──< price_history (N)
                        └──> categories (N:1)

stores (1) ──< price_history (N)
```

### 2.2. Szczegóły relacji

| Relacja | Typ | Klucz obcy | ON DELETE |
|---------|-----|------------|-----------|
| stores → flyers | 1:N | flyers.store_id | RESTRICT |
| flyers → product_offers | 1:N | product_offers.flyer_id | CASCADE |
| products → product_offers | 1:N | product_offers.product_id | RESTRICT |
| categories → products | 1:N | products.category_id | RESTRICT |
| products → price_history | 1:N | price_history.product_id | CASCADE |
| stores → price_history | 1:N | price_history.store_id | CASCADE |
| product_offers → price_history | 1:N | price_history.source_offer_id | SET NULL |
| flyers → extraction_logs | 1:N | extraction_logs.flyer_id | CASCADE |
| product_offers → extraction_logs | 1:N | extraction_logs.product_offer_id | SET NULL |
| flyers → llm_logs | 1:N | llm_logs.flyer_id | SET NULL |
| product_offers → llm_logs | 1:N | llm_logs.product_offer_id | SET NULL |

## 3. Indeksy

### 3.1. Indeksy podstawowe (PRIMARY KEY)
Wszystkie tabele mają indeks PRIMARY KEY na kolumnie `id` (UUID).

### 3.2. Indeksy wydajnościowe

#### stores
```sql
CREATE INDEX idx_stores_slug ON stores(slug);
```

#### flyers
```sql
CREATE INDEX idx_flyers_store_id ON flyers(store_id);
CREATE INDEX idx_flyers_valid_dates ON flyers(valid_from, valid_to);
CREATE INDEX idx_flyers_extraction_status ON flyers(extraction_status) WHERE extraction_status != 'completed';
CREATE INDEX idx_flyers_issue_date ON flyers(issue_date DESC);
```

#### categories
```sql
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_display_order ON categories(display_order);
```

#### products
```sql
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_normalized_name ON products(normalized_name);
CREATE INDEX idx_products_brand ON products(brand) WHERE brand IS NOT NULL;
CREATE INDEX idx_products_search_vector ON products USING GIN(search_vector);
```

#### product_offers
```sql
CREATE INDEX idx_product_offers_flyer_id ON product_offers(flyer_id);
CREATE INDEX idx_product_offers_product_id ON product_offers(product_id);
CREATE INDEX idx_product_offers_promo_price_desc ON product_offers(promo_price DESC);
CREATE INDEX idx_product_offers_valid_dates ON product_offers(valid_from, valid_to);
CREATE INDEX idx_product_offers_conditions ON product_offers USING GIN(conditions);
CREATE INDEX idx_product_offers_discount ON product_offers(discount_percentage DESC NULLS LAST) WHERE discount_percentage IS NOT NULL;
CREATE INDEX idx_product_offers_unverified ON product_offers(extraction_confidence) WHERE manually_verified = FALSE;
```

#### price_history
```sql
CREATE INDEX idx_price_history_product_id ON price_history(product_id);
CREATE INDEX idx_price_history_store_id ON price_history(store_id);
CREATE INDEX idx_price_history_valid_from ON price_history(valid_from DESC);
CREATE INDEX idx_price_history_composite ON price_history(product_id, store_id, valid_from DESC);
```

#### extraction_logs
```sql
CREATE INDEX idx_extraction_logs_flyer_id ON extraction_logs(flyer_id);
CREATE INDEX idx_extraction_logs_created_at ON extraction_logs(created_at DESC);
CREATE INDEX idx_extraction_logs_status ON extraction_logs(status) WHERE status = 'error';
```

#### llm_logs
```sql
CREATE INDEX idx_llm_logs_flyer_id ON llm_logs(flyer_id);
CREATE INDEX idx_llm_logs_created_at ON llm_logs(created_at DESC);
CREATE INDEX idx_llm_logs_status ON llm_logs(status) WHERE status = 'error';
CREATE INDEX idx_llm_logs_model ON llm_logs(model);
```

#### audit_logs
```sql
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at DESC);
CREATE INDEX idx_audit_logs_changed_by ON audit_logs(changed_by) WHERE changed_by IS NOT NULL;
```

### 3.3. Indeksy zaawansowane (planowane przy dużym wolumenie)

```sql
-- Indeks BRIN na created_at dla extraction_logs przy wolumenie >1M/miesiąc
-- CREATE INDEX idx_extraction_logs_created_at_brin ON extraction_logs USING BRIN(created_at);

-- Indeks BRIN na created_at dla llm_logs przy wolumenie >1M/miesiąc
-- CREATE INDEX idx_llm_logs_created_at_brin ON llm_logs USING BRIN(created_at);
```

## 4. Widoki zmaterializowane

### 4.1. parsing_error_stats
Statystyki błędów parsowania dla monitorowania progu 5%.

```sql
CREATE MATERIALIZED VIEW parsing_error_stats AS
SELECT 
    DATE_TRUNC('week', el.created_at) AS week_start,
    f.store_id,
    s.name AS store_name,
    COUNT(*) AS total_extractions,
    COUNT(*) FILTER (WHERE el.status = 'error') AS error_count,
    ROUND(
        (COUNT(*) FILTER (WHERE el.status = 'error')::DECIMAL / NULLIF(COUNT(*), 0) * 100), 
        2
    ) AS error_rate_percentage,
    MAX(el.created_at) AS last_extraction
FROM extraction_logs el
JOIN flyers f ON el.flyer_id = f.id
JOIN stores s ON f.store_id = s.id
WHERE el.created_at >= NOW() - INTERVAL '8 weeks'
GROUP BY DATE_TRUNC('week', el.created_at), f.store_id, s.name;

CREATE UNIQUE INDEX idx_parsing_error_stats_unique ON parsing_error_stats(week_start, store_id);
CREATE INDEX idx_parsing_error_stats_error_rate ON parsing_error_stats(error_rate_percentage DESC);
```

### 4.2. Odświeżanie widoku

```sql
-- Funkcja do odświeżania widoku (może być wywoływana przez pg_cron)
CREATE OR REPLACE FUNCTION refresh_parsing_error_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY parsing_error_stats;
END;
$$ LANGUAGE plpgsql;
```

## 5. Funkcje i triggery

### 5.1. Aktualizacja timestamp updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggery dla wszystkich tabel z kolumną updated_at
CREATE TRIGGER trigger_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_flyers_updated_at BEFORE UPDATE ON flyers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_product_offers_updated_at BEFORE UPDATE ON product_offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5.2. Triggery audytowe dla product_offers

```sql
CREATE OR REPLACE FUNCTION audit_product_offers()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, record_id, operation, old_values, changed_by)
        VALUES ('product_offers', OLD.id, 'DELETE', row_to_json(OLD)::jsonb, auth.uid());
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (table_name, record_id, operation, old_values, new_values, changed_by)
        VALUES ('product_offers', NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, auth.uid());
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, record_id, operation, new_values, changed_by)
        VALUES ('product_offers', NEW.id, 'INSERT', row_to_json(NEW)::jsonb, auth.uid());
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_audit_product_offers
AFTER INSERT OR UPDATE OR DELETE ON product_offers
FOR EACH ROW EXECUTE FUNCTION audit_product_offers();
```

### 5.3. Triggery audytowe dla flyers

```sql
CREATE OR REPLACE FUNCTION audit_flyers()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, record_id, operation, old_values, changed_by)
        VALUES ('flyers', OLD.id, 'DELETE', row_to_json(OLD)::jsonb, auth.uid());
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (table_name, record_id, operation, old_values, new_values, changed_by)
        VALUES ('flyers', NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, auth.uid());
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, record_id, operation, new_values, changed_by)
        VALUES ('flyers', NEW.id, 'INSERT', row_to_json(NEW)::jsonb, auth.uid());
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_audit_flyers
AFTER INSERT OR UPDATE OR DELETE ON flyers
FOR EACH ROW EXECUTE FUNCTION audit_flyers();
```

### 5.4. Funkcja alertu przy przekroczeniu progu błędów

```sql
CREATE OR REPLACE FUNCTION check_parsing_error_threshold()
RETURNS void AS $$
DECLARE
    v_record RECORD;
    v_threshold DECIMAL := 5.0;
BEGIN
    FOR v_record IN 
        SELECT 
            week_start,
            store_name,
            error_rate_percentage,
            total_extractions,
            error_count
        FROM parsing_error_stats
        WHERE error_rate_percentage > v_threshold
        AND week_start >= DATE_TRUNC('week', NOW())
    LOOP
        -- Tutaj można zintegrować z systemem powiadomień (np. pg_notify, webhook)
        RAISE WARNING 'ALERT: Parsing error rate exceeded threshold for % in week %: %.2f%% (% errors / % total)',
            v_record.store_name,
            v_record.week_start,
            v_record.error_rate_percentage,
            v_record.error_count,
            v_record.total_extractions;
        
        -- Przykład użycia NOTIFY dla aplikacji nasłuchującej
        PERFORM pg_notify('parsing_error_alert', 
            json_build_object(
                'store', v_record.store_name,
                'week', v_record.week_start,
                'error_rate', v_record.error_rate_percentage,
                'total', v_record.total_extractions
            )::text
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### 5.5. Automatyczna rotacja logów (retencja 90 dni)

```sql
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM extraction_logs WHERE created_at < NOW() - INTERVAL '90 days';
    DELETE FROM llm_logs WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Opcjonalnie: cleanup audit_logs
    -- DELETE FROM audit_logs WHERE changed_at < NOW() - INTERVAL '365 days';
END;
$$ LANGUAGE plpgsql;

-- Zaplanowanie w pg_cron (wymaga rozszerzenia pg_cron)
-- SELECT cron.schedule('cleanup-logs', '0 2 * * *', 'SELECT cleanup_old_logs()');
```

## 6. Polityki Row Level Security (RLS)

### 6.1. Włączenie RLS

```sql
-- RLS dla tabel z danymi publicznymi (odczyt dla wszystkich)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE flyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- RLS dla tabel z logami (ograniczony dostęp)
ALTER TABLE extraction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### 6.2. Polityki dla tabel publicznych

```sql
-- stores: odczyt dla wszystkich
CREATE POLICY "Allow public read access to stores"
ON stores FOR SELECT
TO authenticated
USING (true);

-- flyers: odczyt dla wszystkich
CREATE POLICY "Allow public read access to flyers"
ON flyers FOR SELECT
TO authenticated
USING (true);

-- categories: odczyt dla wszystkich
CREATE POLICY "Allow public read access to categories"
ON categories FOR SELECT
TO authenticated
USING (true);

-- products: odczyt dla wszystkich
CREATE POLICY "Allow public read access to products"
ON products FOR SELECT
TO authenticated
USING (true);

-- product_offers: odczyt dla wszystkich
CREATE POLICY "Allow public read access to product_offers"
ON product_offers FOR SELECT
TO authenticated
USING (true);

-- price_history: odczyt dla wszystkich
CREATE POLICY "Allow public read access to price_history"
ON price_history FOR SELECT
TO authenticated
USING (true);
```

### 6.3. Polityki dla tabel logów

```sql
-- extraction_logs: tylko dla adminów
CREATE POLICY "Allow admin read access to extraction_logs"
ON extraction_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- llm_logs: tylko dla adminów
CREATE POLICY "Allow admin read access to llm_logs"
ON llm_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- audit_logs: tylko dla adminów
CREATE POLICY "Allow admin read access to audit_logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);
```

### 6.4. Polityki zapisu (dla systemowych operacji)

```sql
-- Tworzenie service role dla operacji backend (poza RLS)
-- Backend będzie używał service_role key, który omija RLS

-- Opcjonalnie: polityki INSERT/UPDATE/DELETE dla adminów
CREATE POLICY "Allow admin write access to stores"
ON stores FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Podobne polityki dla pozostałych tabel operacyjnych
```

## 7. Rozszerzenia PostgreSQL

```sql
-- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Full-text search dla polskiego
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- pg_cron dla zaplanowanych zadań (wymaga uprawnień superuser)
-- CREATE EXTENSION IF NOT EXISTS "pg_cron";
```

## 8. Dane inicjalne (seed data)

### 8.1. Sklepy

```sql
INSERT INTO stores (id, name, slug, website_url) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Biedronka', 'biedronka', 'https://www.biedronka.pl'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Lidl', 'lidl', 'https://www.lidl.pl');
```

### 8.2. Przykładowe kategorie

```sql
INSERT INTO categories (name, slug, display_order) VALUES
    ('Owoce i warzywa', 'owoce-warzywa', 1),
    ('Mięso i wędliny', 'mieso-wedliny', 2),
    ('Nabiał', 'nabial', 3),
    ('Pieczywo', 'pieczywo', 4),
    ('Napoje', 'napoje', 5),
    ('Słodycze i przekąski', 'slodycze-przekaski', 6),
    ('Chemia domowa', 'chemia-domowa', 7),
    ('Kosmetyki', 'kosmetyki', 8),
    ('Artykuły przemysłowe', 'artykuly-przemyslowe', 9),
    ('Inne', 'inne', 999);
```

## 9. Uwagi dotyczące decyzji projektowych

### 9.1. Normalizacja
- Schemat jest znormalizowany do 3NF
- Rozdzielenie `products` i `product_offers` umożliwia śledzenie tego samego produktu w różnych ofertach
- Płaska struktura kategorii (bez hierarchii) upraszcza MVP

### 9.2. Wydajność
- Indeksy B-tree na najczęściej używanych kolumnach do filtrowania i sortowania
- Indeks GIN na `conditions` (JSONB) dla elastycznego wyszukiwania warunków promocji
- Indeks GIN na `search_vector` dla pełnotekstowego wyszukiwania produktów
- Widok zmaterializowany `parsing_error_stats` dla szybkiego dostępu do statystyk

### 9.3. Retencja danych
- Logi `extraction_logs` i `llm_logs` automatycznie usuwane po 90 dniach
- Możliwość przedłużenia retencji dla `audit_logs` (domyślnie bez limitu)

### 9.4. Bezpieczeństwo
- RLS na wszystkich tabelach
- Publiczny odczyt dla danych promocyjnych (stores, flyers, products, product_offers)
- Ograniczony dostęp do logów (tylko admin)
- Supabase Auth zarządza użytkownikami (poza schematem public)

### 9.5. Audyt
- Automatyczne triggery dla `product_offers` i `flyers`
- Możliwość rozszerzenia na inne krytyczne tabele
- Zapisywanie zmian jako JSONB dla elastyczności

### 9.6. Monitorowanie
- Widok `parsing_error_stats` agreguje błędy parsowania
- Funkcja `check_parsing_error_threshold()` wykrywa przekroczenie progu 5%
- Wykorzystanie `pg_notify` do wysyłania alertów do aplikacji

### 9.7. Skalowalność
- Możliwość dodania indeksów BRIN przy dużym wolumenie (>1M/miesiąc)
- Struktura przygotowana na partycjonowanie w przyszłości (np. flyers, product_offers po dacie)
- JSONB dla elastycznych struktur danych (conditions, metadata)

### 9.8. Nierozstrzygnięte kwestie z sesji planowania

#### 8.8.1. JSON Schema dla conditions
Zalecane wprowadzenie walidacji JSON Schema dla kolumny `product_offers.conditions`:

```sql
-- Przykładowa struktura conditions:
-- {
--   "min_quantity": 2,
--   "max_quantity": 5,
--   "loyalty_card_required": true,
--   "valid_days": ["monday", "tuesday"],
--   "description": "Przy zakupie min. 2 sztuk"
-- }

ALTER TABLE product_offers ADD CONSTRAINT check_conditions_schema
CHECK (
    conditions IS NULL OR (
        jsonb_typeof(conditions) = 'object'
        -- Dodatkowe walidacje mogą być dodane tutaj
    )
);
```

#### 8.8.2. Szczegóły RLS dla extraction_logs
Obecnie `extraction_logs` mają dostęp tylko dla adminów. W przyszłości można rozważyć:
- Dostęp dla użytkowników z rolą "moderator"
- Ograniczony widok błędów dla użytkowników (bez szczegółów technicznych)

#### 8.8.3. Estymacje wolumenu
Przy braku dokładnych estymacji zaleca się:
- Monitoring wydajności zapytań (pg_stat_statements)
- Regularne ANALYZE i VACUUM
- Przegląd indeksów po 3-6 miesiącach działania produkcyjnego

### 9.9. Integracja z Supabase

#### 9.9.1. Użycie Supabase Auth
- Tabela `auth.users` zarządzana przez Supabase
- Dostęp do `auth.uid()` w politykach RLS
- Pole `raw_user_meta_data->>'role'` dla ról użytkowników

#### 9.9.2. Supabase Storage
- PDF-y gazetek mogą być przechowywane w Supabase Storage
- `flyers.source_url` będzie wskazywać na storage bucket
- Bucket może być publiczny (read-only) lub prywatny z signed URLs

#### 9.9.3. Realtime subscriptions
Możliwość włączenia Supabase Realtime dla:
- `product_offers` (nowe promocje)
- `flyers` (nowe gazetki)

```sql
-- Włączenie realtime dla wybranych tabel
ALTER PUBLICATION supabase_realtime ADD TABLE product_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE flyers;
```

### 9.10. Migracje

Schemat powinien być implementowany przez migracje Supabase:
1. Inicjalna migracja z tabelami podstawowymi
2. Migracja z indeksami
3. Migracja z funkcjami i triggerami
4. Migracja z politykami RLS
5. Migracja z danymi seed (stores, categories)

Każda migracja powinna być idempotentna i posiadać rollback.

