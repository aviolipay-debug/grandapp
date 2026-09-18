-- Migration de référence — capture l'état actuel du schéma Devisfinance (ex-OliPay, repo grandapp).
--
-- Contexte : jusqu'ici, tous les changements de schéma (nouvelles colonnes,
-- table projects, policies RLS, index...) ont été appliqués directement via
-- le SQL Editor de Supabase, sans jamais être enregistrés comme migrations
-- versionnées. Cette migration sert de point de départ propre : elle
-- documente l'état actuel (vérifié en direct sur la base de production le
-- 2026-09-10) pour qu'à partir de maintenant, tout changement futur puisse
-- être suivi comme une vraie migration.
--
-- SANS DANGER à exécuter même si tout existe déjà : chaque instruction est
-- idempotente (IF NOT EXISTS, ou DROP POLICY IF EXISTS + recréation).
--
-- Pour l'utiliser avec la CLI Supabase : place ce fichier dans
-- supabase/migrations/ (nom conseillé : un préfixe date antérieur à tes
-- prochaines migrations, ex. 20260101000000_baseline_schema.sql), puis
-- `supabase db push` si tu veux le lier à un projet distant, ou garde-le
-- simplement comme trace versionnée dans Git.

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  full_name text,
  company_name text,
  company_logo_url text,
  company_address text,
  phone text,
  plan text NOT NULL DEFAULT 'free'::text CHECK (plan = ANY (ARRAY['free'::text, 'pro'::text, 'business'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  business_sector text,
  company_email text,
  company_contacts jsonb NOT NULL DEFAULT '[]'::jsonb,
  rccm_number text,
  tax_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  signature_url text,
  invoice_template text NOT NULL DEFAULT 'classic'::text,
  company_phone text,
  whatsapp_number text,
  finance_pin_hash text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.clients (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  type text CHECK (type = ANY (ARRAY['entreprise'::text, 'particulier'::text])),
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  client_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'attente'::text CHECK (status = ANY (ARRAY['en_cours'::text, 'termine'::text, 'attente'::text])),
  was_in_progress boolean NOT NULL DEFAULT false,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id),
  CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);

CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL,
  client_id uuid NOT NULL,
  quote_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'accepted'::text, 'declined'::text, 'expired'::text])),
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  expiry_date date,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_rate numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'FCFA'::text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  project_id uuid,
  objet text,
  discount_rate numeric NOT NULL DEFAULT 0,
  CONSTRAINT quotes_pkey PRIMARY KEY (id),
  CONSTRAINT quotes_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT quotes_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT quotes_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);

CREATE TABLE IF NOT EXISTS public.quote_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  quote_id uuid NOT NULL,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  line_total numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT quote_items_pkey PRIMARY KEY (id),
  CONSTRAINT quote_items_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id)
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL,
  client_id uuid NOT NULL,
  quote_id uuid,
  invoice_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text, 'partially_paid'::text, 'overdue'::text, 'cancelled'::text])),
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_rate numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  amount_paid numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'FCFA'::text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  objet text,
  document_type text NOT NULL DEFAULT 'facture'::text CHECK (document_type = ANY (ARRAY['facture'::text, 'bordereau'::text])),
  discount_rate numeric DEFAULT 0,
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT invoices_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id)
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  invoice_id uuid NOT NULL,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  line_total numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT invoice_items_pkey PRIMARY KEY (id),
  CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id)
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  invoice_id uuid NOT NULL,
  amount numeric NOT NULL,
  method text CHECK (method = ANY (ARRAY['card'::text, 'mobile_money'::text, 'bank_transfer'::text, 'cash'::text, 'other'::text])),
  paid_at timestamp with time zone NOT NULL DEFAULT now(),
  reference text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id)
);

CREATE TABLE IF NOT EXISTS public.catalog_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  default_price numeric NOT NULL DEFAULT 0,
  unit text DEFAULT 'unité'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT catalog_items_pkey PRIMARY KEY (id),
  CONSTRAINT catalog_items_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  catalog_item_id uuid NOT NULL,
  change_qty numeric NOT NULL,
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stock_movements_pkey PRIMARY KEY (id),
  CONSTRAINT stock_movements_catalog_item_id_fkey FOREIGN KEY (catalog_item_id) REFERENCES public.catalog_items(id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Policies — recréées via DROP + CREATE pour rester idempotentes (Postgres
-- ne supporte pas "CREATE POLICY IF NOT EXISTS"). Toutes utilisent déjà
-- (select auth.uid()) plutôt que auth.uid() nu, suite à la correction de
-- performance appliquée le 2026-09-09 (voir Performance Advisor Supabase).

DROP POLICY IF EXISTS "profiles_self" ON public.profiles;
CREATE POLICY "profiles_self" ON public.profiles
  FOR ALL USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "clients_owner" ON public.clients;
CREATE POLICY "clients_owner" ON public.clients
  FOR ALL USING ((select auth.uid()) = owner_id);

DROP POLICY IF EXISTS "Les utilisateurs gèrent leurs propres projets" ON public.projects;
CREATE POLICY "Les utilisateurs gèrent leurs propres projets" ON public.projects
  FOR ALL
  USING ((select auth.uid()) = owner_id)
  WITH CHECK ((select auth.uid()) = owner_id);

DROP POLICY IF EXISTS "quotes_owner" ON public.quotes;
CREATE POLICY "quotes_owner" ON public.quotes
  FOR ALL USING ((select auth.uid()) = owner_id);

DROP POLICY IF EXISTS "quote_items_owner" ON public.quote_items;
CREATE POLICY "quote_items_owner" ON public.quote_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quotes q
      WHERE q.id = quote_items.quote_id
        AND q.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "invoices_owner" ON public.invoices;
CREATE POLICY "invoices_owner" ON public.invoices
  FOR ALL USING ((select auth.uid()) = owner_id);

DROP POLICY IF EXISTS "invoice_items_owner" ON public.invoice_items;
CREATE POLICY "invoice_items_owner" ON public.invoice_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_items.invoice_id
        AND i.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "payments_owner" ON public.payments;
CREATE POLICY "payments_owner" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = payments.invoice_id
        AND i.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = payments.invoice_id
        AND invoices.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "catalog_items_owner" ON public.catalog_items;
CREATE POLICY "catalog_items_owner" ON public.catalog_items
  FOR ALL USING ((select auth.uid()) = owner_id);

DROP POLICY IF EXISTS "stock_movements_owner" ON public.stock_movements;
CREATE POLICY "stock_movements_owner" ON public.stock_movements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM catalog_items c
      WHERE c.id = stock_movements.catalog_item_id
        AND c.owner_id = (select auth.uid())
    )
  );

-- ============================================================
-- INDEX (au-delà des clés primaires/uniques déjà créées ci-dessus)
-- ============================================================

CREATE INDEX IF NOT EXISTS clients_owner_idx ON public.clients (owner_id);
CREATE INDEX IF NOT EXISTS invoices_owner_idx ON public.invoices (owner_id);
CREATE INDEX IF NOT EXISTS invoices_due_date_idx ON public.invoices (due_date);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON public.invoices (status);
CREATE UNIQUE INDEX IF NOT EXISTS invoices_owner_id_invoice_number_key ON public.invoices (owner_id, invoice_number);
CREATE INDEX IF NOT EXISTS quotes_owner_idx ON public.quotes (owner_id);
CREATE INDEX IF NOT EXISTS quotes_status_idx ON public.quotes (status);
CREATE UNIQUE INDEX IF NOT EXISTS quotes_owner_id_quote_number_key ON public.quotes (owner_id, quote_number);
CREATE INDEX IF NOT EXISTS payments_invoice_idx ON public.payments (invoice_id);
CREATE INDEX IF NOT EXISTS catalog_items_owner_idx ON public.catalog_items (owner_id);

-- Index ajoutés le 2026-09-10 pour corriger des colonnes de clé étrangère
-- non indexées (voir diagnostic "foreign keys without index").
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects (owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects (client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON public.quotes (client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_project_id ON public.quotes (project_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON public.quote_items (quote_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices (client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_quote_id ON public.invoices (quote_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items (invoice_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_catalog_item_id ON public.stock_movements (catalog_item_id);
