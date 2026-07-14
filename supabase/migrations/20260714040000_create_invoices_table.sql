-- Crear la tabla de facturas
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  budget_id uuid references public.budgets(id) on delete set null,
  client_id uuid not null references public.clients(id) on delete cascade,
  invoice_number varchar(50) not null,
  status varchar(20) not null default 'pending', -- 'pending', 'paid', 'cancelled'
  issue_date date not null default current_date,
  due_date date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (company_id, invoice_number)
);

-- Habilitar RLS
alter table public.invoices enable row level security;

-- Políticas de RLS
create policy "Users can read invoices in their company"
  on public.invoices for select
  to authenticated
  using (
    exists (
      select 1 from public.company_members
      where company_members.company_id = invoices.company_id
        and company_members.user_id = auth.uid()
        and company_members.active = true
    )
  );

create policy "Users can insert invoices in their company"
  on public.invoices for insert
  to authenticated
  with check (
    exists (
      select 1 from public.company_members
      where company_id = invoices.company_id
        and user_id = auth.uid()
        and active = true
    )
  );

create policy "Users can update invoices in their company"
  on public.invoices for update
  to authenticated
  using (
    exists (
      select 1 from public.company_members
      where company_id = invoices.company_id
        and user_id = auth.uid()
        and active = true
    )
  );

create policy "Users can delete invoices in their company"
  on public.invoices for delete
  to authenticated
  using (
    exists (
      select 1 from public.company_members
      where company_id = invoices.company_id
        and user_id = auth.uid()
        and active = true
    )
  );

-- Habilitar RLS en la web de administración para superadministrador
create policy "admin_web_super_admin_reads_invoices"
  on public.invoices for select
  to authenticated
  using ((select private.is_super_admin()));

grant all on public.invoices to authenticated;
