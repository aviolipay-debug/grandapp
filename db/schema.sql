-- ============================================================
-- SCHÉMA DE BASE DE DONNÉES — SaaS de facturation & devis
-- Compatible Supabase (Postgres + Auth intégré + RLS)
-- ============================================================

-- Extension pour générer des UUID
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- 1. PROFILS UTILISATEURS
-- Étend la table auth.users gérée automatiquement par Supabase
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  company_logo_url text,
  company_address text,
  phone text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'business')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. CLIENTS (les clients de l'utilisateur, pas les utilisateurs de la plateforme)
-- ------------------------------------------------------------
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamptz not null default now()
);

create index clients_owner_idx on public.clients(owner_id);

-- ------------------------------------------------------------
-- 3. DEVIS (quotes)
-- ------------------------------------------------------------
create table public.quotes (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  quote_number text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined', 'expired')),
  issue_date date not null default current_date,
  expiry_date date,
  subtotal numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'CFA',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, quote_number)
);

create index quotes_owner_idx on public.quotes(owner_id);
create index quotes_status_idx on public.quotes(status);

create table public.quote_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0,
  sort_order int not null default 0
);

-- ------------------------------------------------------------
-- 4. FACTURES (invoices) — peuvent naître d'un devis accepté ou être créées directement
-- ------------------------------------------------------------
create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  quote_id uuid references public.quotes(id) on delete set null,
  invoice_number text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled')),
  issue_date date not null default current_date,
  due_date date,
  subtotal numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  total numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  currency text not null default 'CFA',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, invoice_number)
);

create index invoices_owner_idx on public.invoices(owner_id);
create index invoices_status_idx on public.invoices(status);
create index invoices_due_date_idx on public.invoices(due_date);

create table public.invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0,
  sort_order int not null default 0
);

-- ------------------------------------------------------------
-- 5. PAIEMENTS (traçabilité, une facture peut avoir plusieurs paiements partiels)
-- ------------------------------------------------------------
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  method text check (method in ('card', 'mobile_money', 'bank_transfer', 'cash', 'other')),
  paid_at timestamptz not null default now(),
  reference text
);

create index payments_invoice_idx on public.payments(invoice_id);

-- ------------------------------------------------------------
-- 6. PRODUITS/SERVICES CATALOGUE (pour remplir les devis/factures plus vite)
-- ------------------------------------------------------------
create table public.catalog_items (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  default_price numeric(12,2) not null default 0,
  unit text default 'unité',
  created_at timestamptz not null default now()
);

create index catalog_items_owner_idx on public.catalog_items(owner_id);

-- ------------------------------------------------------------
-- 7. STOCK (optionnel — pour le module boutique en ligne futur)
-- ------------------------------------------------------------
create table public.stock_movements (
  id uuid primary key default uuid_generate_v4(),
  catalog_item_id uuid not null references public.catalog_items(id) on delete cascade,
  change_qty numeric(10,2) not null,
  reason text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY — chaque utilisateur ne voit que ses données
-- ============================================================
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.catalog_items enable row level security;
alter table public.stock_movements enable row level security;

-- Profiles : chacun voit et modifie uniquement son propre profil
create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id);

-- Clients
create policy "clients_owner" on public.clients
  for all using (auth.uid() = owner_id);

-- Devis
create policy "quotes_owner" on public.quotes
  for all using (auth.uid() = owner_id);

create policy "quote_items_owner" on public.quote_items
  for all using (
    exists (select 1 from public.quotes q where q.id = quote_id and q.owner_id = auth.uid())
  );

-- Factures
create policy "invoices_owner" on public.invoices
  for all using (auth.uid() = owner_id);

create policy "invoice_items_owner" on public.invoice_items
  for all using (
    exists (select 1 from public.invoices i where i.id = invoice_id and i.owner_id = auth.uid())
  );

-- Paiements
create policy "payments_owner" on public.payments
  for all using (
    exists (select 1 from public.invoices i where i.id = invoice_id and i.owner_id = auth.uid())
  );

-- Catalogue
create policy "catalog_items_owner" on public.catalog_items
  for all using (auth.uid() = owner_id);

-- Stock
create policy "stock_movements_owner" on public.stock_movements
  for all using (
    exists (select 1 from public.catalog_items c where c.id = catalog_item_id and c.owner_id = auth.uid())
  );

-- ============================================================
-- TRIGGER : créer automatiquement un profil à l'inscription
-- ============================================================
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
