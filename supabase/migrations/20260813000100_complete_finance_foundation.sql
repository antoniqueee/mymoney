begin;

-- My Money's final single-user finance schema. This migration intentionally
-- upgrades 001_initial_schema.sql in place so existing local data is retained.
create extension if not exists pgcrypto with schema extensions;

create or replace function public.is_owner(owner_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select (select auth.uid()) = owner_id;
$$;

revoke all on function public.is_owner(uuid) from public;
grant execute on function public.is_owner(uuid) to authenticated, service_role;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = statement_timestamp();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;

-- Profiles ------------------------------------------------------------------
alter table public.profiles
  add column if not exists currency_code text,
  add column if not exists theme text,
  add column if not exists updated_at timestamptz;

update public.profiles
set
  currency_code = coalesce(currency_code, 'IDR'),
  theme = coalesce(theme, 'system'),
  updated_at = coalesce(updated_at, created_at, now());

alter table public.profiles
  alter column currency_code set default 'IDR',
  alter column currency_code set not null,
  alter column theme set default 'system',
  alter column theme set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

alter table public.profiles
  add constraint profiles_currency_code_check
    check (currency_code in ('IDR', 'USD', 'SGD')),
  add constraint profiles_theme_check
    check (theme in ('light', 'dark', 'system'));

-- Accounts ------------------------------------------------------------------
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 64),
  type text not null check (type in ('cash', 'bank', 'ewallet', 'other')),
  opening_balance numeric(14,2) not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_id_user_id_key unique (id, user_id)
);

-- Categories ----------------------------------------------------------------
alter table public.categories
  add column if not exists is_default boolean,
  add column if not exists is_archived boolean,
  add column if not exists updated_at timestamptz;

update public.categories
set
  color = coalesce(color, '#2563EB'),
  icon = coalesce(icon, 'tag'),
  is_default = coalesce(is_default, false),
  is_archived = coalesce(is_archived, false),
  updated_at = coalesce(updated_at, created_at, now());

alter table public.categories
  alter column color set default '#2563EB',
  alter column color set not null,
  alter column icon set default 'tag',
  alter column icon set not null,
  alter column is_default set default false,
  alter column is_default set not null,
  alter column is_archived set default false,
  alter column is_archived set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

alter table public.categories
  add constraint categories_name_check
    check (char_length(btrim(name)) between 1 and 48),
  add constraint categories_color_check
    check (color ~ '^#[0-9A-Fa-f]{6}$'),
  add constraint categories_id_user_id_key unique (id, user_id),
  add constraint categories_id_user_id_type_key unique (id, user_id, type);

-- Internal bootstrap is deliberately not executable by API roles. It is used
-- by the auth trigger and below to bring pre-existing users to the same state.
create or replace function public.bootstrap_user_finance(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'Profile must exist before finance bootstrap';
  end if;

  insert into public.accounts (user_id, name, type, opening_balance)
  select p_user_id, 'Tunai', 'cash', 0::numeric
  where not exists (
    select 1 from public.accounts where user_id = p_user_id
  );

  insert into public.categories (user_id, name, type, color, icon, is_default)
  select p_user_id, defaults.name, defaults.type, defaults.color, defaults.icon, true
  from (values
    ('Gaji & Pendapatan', 'income', '#16A34A', 'wallet'),
    ('Bonus',             'income', '#059669', 'gift'),
    ('Investasi',         'income', '#0D9488', 'piggy-bank'),
    ('Pendapatan Lainnya','income', '#0284C7', 'briefcase'),
    ('Makanan & Minuman', 'expense','#EF4444', 'utensils'),
    ('Transportasi',      'expense','#2563EB', 'car'),
    ('Tagihan & Utilitas','expense','#F59E0B', 'receipt'),
    ('Belanja',           'expense','#DB2777', 'shopping-bag'),
    ('Kesehatan',         'expense','#DC2626', 'heart-pulse'),
    ('Hiburan',           'expense','#7C3AED', 'gamepad-2'),
    ('Lainnya',           'expense','#64748B', 'tag')
  ) as defaults(name, type, color, icon)
  where not exists (
    select 1
    from public.categories existing
    where existing.user_id = p_user_id
      and existing.type = defaults.type
      and lower(existing.name) = lower(defaults.name)
  );
end;
$$;

revoke all on function public.bootstrap_user_finance(uuid) from public, anon, authenticated;

select public.bootstrap_user_finance(id) from public.profiles;

-- Transactions --------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'date'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'transaction_date'
  ) then
    alter table public.transactions rename column date to transaction_date;
  end if;
end;
$$;

alter table public.transactions
  add column if not exists account_id uuid,
  add column if not exists transaction_date date,
  add column if not exists payment_method text,
  add column if not exists attachment_path text,
  add column if not exists deleted_at timestamptz,
  add column if not exists updated_at timestamptz;

-- If a partially upgraded database contains both date columns, retain the old
-- value before removing the obsolete column.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'date'
  ) then
    execute 'update public.transactions set transaction_date = coalesce(transaction_date, date)';
    alter table public.transactions drop column date;
  end if;
end;
$$;

update public.transactions transaction
set account_id = (
  select account.id
  from public.accounts account
  where account.user_id = transaction.user_id
  order by (account.type = 'cash') desc, account.created_at, account.id
  limit 1
)
where transaction.account_id is null;

update public.transactions transaction
set category_id = (
  select category.id
  from public.categories category
  where category.user_id = transaction.user_id
    and category.type = transaction.type
  order by category.is_default desc, category.created_at, category.id
  limit 1
)
where transaction.category_id is null;

update public.transactions
set
  transaction_date = coalesce(transaction_date, current_date),
  payment_method = coalesce(payment_method, 'cash'),
  updated_at = coalesce(updated_at, created_at, now());

alter table public.transactions
  alter column amount type numeric(14,2) using amount::numeric(14,2),
  alter column account_id set not null,
  alter column category_id set not null,
  alter column transaction_date set default current_date,
  alter column transaction_date set not null,
  alter column payment_method set default 'cash',
  alter column payment_method set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

alter table public.transactions
  drop constraint if exists transactions_category_id_fkey;

alter table public.transactions
  add constraint transactions_payment_method_check check (
    payment_method in ('cash', 'debit_card', 'credit_card', 'bank_transfer', 'e_wallet', 'other')
  ),
  add constraint transactions_attachment_owner_check check (
    attachment_path is null or split_part(attachment_path, '/', 1) = user_id::text
  ),
  add constraint transactions_account_owner_fkey
    foreign key (account_id, user_id)
    references public.accounts(id, user_id)
    on update restrict on delete restrict,
  add constraint transactions_category_owner_type_fkey
    foreign key (category_id, user_id, type)
    references public.categories(id, user_id, type)
    on update restrict on delete restrict;

-- New transactions must use active references. Historical rows may continue
-- to be edited when they retain the same archived account/category; changing
-- either reference requires the replacement to be active at that moment.
create or replace function public.validate_transaction_active_references()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- OLD is not populated for INSERT triggers, so keep the INSERT and UPDATE
  -- paths separate rather than relying on boolean short-circuit evaluation.
  if tg_op = 'INSERT' then
    perform 1
    from public.accounts account
    where account.id = new.account_id
      and account.user_id = new.user_id
      and account.is_archived = false
    for share;

    if not found then
      raise exception 'Transactions require an active account'
        using errcode = '23514';
    end if;

    perform 1
    from public.categories category
    where category.id = new.category_id
      and category.user_id = new.user_id
      and category.type = new.type
      and category.is_archived = false
    for share;

    if not found then
      raise exception 'Transactions require an active category matching their type'
        using errcode = '23514';
    end if;
  else
    if new.user_id is distinct from old.user_id
       or new.account_id is distinct from old.account_id then
      perform 1
      from public.accounts account
      where account.id = new.account_id
        and account.user_id = new.user_id
        and account.is_archived = false
      for share;

      if not found then
        raise exception 'Transactions require an active account'
          using errcode = '23514';
      end if;
    end if;

    if new.user_id is distinct from old.user_id
       or new.category_id is distinct from old.category_id
       or new.type is distinct from old.type then
      perform 1
      from public.categories category
      where category.id = new.category_id
        and category.user_id = new.user_id
        and category.type = new.type
        and category.is_archived = false
      for share;

      if not found then
        raise exception 'Transactions require an active category matching their type'
          using errcode = '23514';
      end if;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.validate_transaction_active_references() from public;

create trigger transactions_validate_active_references
before insert or update of user_id, account_id, category_id, type
on public.transactions
for each row execute function public.validate_transaction_active_references();

-- Budgets -------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'budgets' and column_name = 'amount_limit'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'budgets' and column_name = 'amount'
  ) then
    alter table public.budgets rename column amount_limit to amount;
  end if;
end;
$$;

alter table public.budgets
  add column if not exists amount numeric(14,2),
  add column if not exists period_start date,
  add column if not exists period_end date,
  add column if not exists updated_at timestamptz;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'budgets' and column_name = 'amount_limit'
  ) then
    execute 'update public.budgets set amount = coalesce(amount, amount_limit)';
    alter table public.budgets drop column amount_limit;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'budgets' and column_name = 'month'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'budgets' and column_name = 'year'
  ) then
    execute $migration$
      update public.budgets
      set
        period_start = coalesce(period_start, make_date(year, month, 1)),
        period_end = coalesce(period_end, (make_date(year, month, 1) + interval '1 month - 1 day')::date)
    $migration$;
  end if;
end;
$$;

update public.budgets
set
  period_start = coalesce(period_start, date_trunc('month', current_date)::date),
  period_end = coalesce(
    period_end,
    (date_trunc('month', coalesce(period_start, current_date)) + interval '1 month - 1 day')::date
  ),
  updated_at = coalesce(updated_at, created_at, now());

alter table public.budgets
  drop constraint if exists budgets_user_id_category_id_month_year_key,
  drop constraint if exists budgets_category_id_fkey;

alter table public.budgets
  drop column if exists month,
  drop column if exists year;

alter table public.budgets
  alter column amount type numeric(14,2) using amount::numeric(14,2),
  alter column amount set not null,
  alter column period_start set not null,
  alter column period_end set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

alter table public.budgets
  add constraint budgets_amount_check check (amount > 0),
  add constraint budgets_period_check check (period_end >= period_start),
  add constraint budgets_category_owner_fkey
    foreign key (category_id, user_id)
    references public.categories(id, user_id)
    on update restrict on delete restrict,
  add constraint budgets_exact_period_key
    unique (user_id, category_id, period_start, period_end);

-- The legacy schema did not restrict budgets to expense categories. Refuse to
-- complete the upgrade with semantically invalid historical rows instead of
-- silently carrying them into a schema that promises expense-only budgets.
do $budget_invariant$
begin
  if exists (
    select 1
    from public.budgets budget
    join public.categories category
      on category.id = budget.category_id
     and category.user_id = budget.user_id
    where category.type <> 'expense'
  ) then
    raise exception 'Existing budgets must reference expense categories before this migration can be applied';
  end if;
end;
$budget_invariant$;

create or replace function public.validate_expense_budget_category()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.categories
    where id = new.category_id
      and user_id = new.user_id
      and type = 'expense'
  ) then
    raise exception 'Budgets require an expense category' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function public.validate_expense_budget_category() from public;

create trigger budgets_validate_expense_category
before insert or update of category_id, user_id on public.budgets
for each row execute function public.validate_expense_budget_category();

-- Category type is immutable after creation. Besides preserving transaction
-- meaning, this guarantees an expense category referenced by a budget cannot
-- later be converted into an income category through the REST API.
create or replace function public.prevent_category_type_change()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.type is distinct from old.type then
    raise exception 'Category type cannot be changed after creation'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function public.prevent_category_type_change() from public;

create trigger categories_prevent_type_change
before update of type on public.categories
for each row execute function public.prevent_category_type_change();

-- Savings goals -------------------------------------------------------------
create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  target_amount numeric(14,2) not null check (target_amount > 0),
  current_amount numeric(14,2) not null default 0 check (current_amount >= 0),
  deadline date,
  status text not null default 'active'
    check (status in ('active', 'paused', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Query indexes -------------------------------------------------------------
create index accounts_user_archived_idx
  on public.accounts (user_id, is_archived, created_at);
create unique index accounts_user_name_key
  on public.accounts (user_id, lower(name));
create index categories_user_type_archived_idx
  on public.categories (user_id, type, is_archived, name);
create index transactions_user_date_idx
  on public.transactions (user_id, transaction_date desc);
create index transactions_user_type_idx
  on public.transactions (user_id, type);
create index transactions_user_category_idx
  on public.transactions (user_id, category_id);
create index transactions_user_account_idx
  on public.transactions (user_id, account_id);
create index transactions_user_deleted_idx
  on public.transactions (user_id, deleted_at);
create index transactions_user_description_idx
  on public.transactions (user_id, lower(description));
create index budgets_user_period_idx
  on public.budgets (user_id, period_start, period_end);
create index savings_goals_user_status_idx
  on public.savings_goals (user_id, status, deadline);

-- updated_at triggers -------------------------------------------------------
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger accounts_set_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

create trigger budgets_set_updated_at
before update on public.budgets
for each row execute function public.set_updated_at();

create trigger savings_goals_set_updated_at
before update on public.savings_goals
for each row execute function public.set_updated_at();

-- New Google-auth users receive only their profile and starter bookkeeping
-- records. Metadata is treated as display data, never as authorization data.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

  perform public.bootstrap_user_finance(new.id);
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Row-level security --------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can CRUD their own categories" on public.categories;
drop policy if exists "Users can CRUD their own transactions" on public.transactions;
drop policy if exists "Users can CRUD their own budgets" on public.budgets;

create policy profiles_select_own on public.profiles
for select to authenticated using (public.is_owner(id));
create policy profiles_update_own on public.profiles
for update to authenticated using (public.is_owner(id)) with check (public.is_owner(id));

-- Profile creation is owned by the auth trigger; API roles may only read and
-- update the resulting row. Account deletion is handled through Auth/admin
-- workflows rather than deleting the profile table row directly.
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_delete_own on public.profiles;
revoke insert, delete, truncate on table public.profiles from public, anon, authenticated;
grant insert, delete, truncate on table public.profiles to service_role;

create policy accounts_select_own on public.accounts
for select to authenticated using (public.is_owner(user_id));
create policy accounts_insert_own on public.accounts
for insert to authenticated with check (public.is_owner(user_id));
create policy accounts_update_own on public.accounts
for update to authenticated using (public.is_owner(user_id)) with check (public.is_owner(user_id));
drop policy if exists accounts_delete_own on public.accounts;
revoke delete, truncate on table public.accounts from public, anon, authenticated;
grant delete, truncate on table public.accounts to service_role;

create policy categories_select_own on public.categories
for select to authenticated using (public.is_owner(user_id));
create policy categories_insert_own on public.categories
for insert to authenticated with check (public.is_owner(user_id));
create policy categories_update_own on public.categories
for update to authenticated using (public.is_owner(user_id)) with check (public.is_owner(user_id));
drop policy if exists categories_delete_own on public.categories;
revoke delete, truncate on table public.categories from public, anon, authenticated;
grant delete, truncate on table public.categories to service_role;

create policy transactions_select_own on public.transactions
for select to authenticated using (public.is_owner(user_id));
create policy transactions_insert_own on public.transactions
for insert to authenticated with check (public.is_owner(user_id));
create policy transactions_update_own on public.transactions
for update to authenticated using (public.is_owner(user_id)) with check (public.is_owner(user_id));

-- Transactions are removed only through the soft-delete UPDATE path. Keep an
-- explicit policy drop for databases where an earlier migration was applied,
-- and revoke the table privilege as defense in depth. service_role retains its
-- own privileges and BYPASSRLS behavior for administrative recovery.
drop policy if exists transactions_delete_own on public.transactions;
revoke delete, truncate on table public.transactions from public, anon, authenticated;
grant delete, truncate on table public.transactions to service_role;

create policy budgets_select_own on public.budgets
for select to authenticated using (public.is_owner(user_id));
create policy budgets_insert_own on public.budgets
for insert to authenticated with check (public.is_owner(user_id));
create policy budgets_update_own on public.budgets
for update to authenticated using (public.is_owner(user_id)) with check (public.is_owner(user_id));
create policy budgets_delete_own on public.budgets
for delete to authenticated using (public.is_owner(user_id));

create policy savings_goals_select_own on public.savings_goals
for select to authenticated using (public.is_owner(user_id));
create policy savings_goals_insert_own on public.savings_goals
for insert to authenticated with check (public.is_owner(user_id));
create policy savings_goals_update_own on public.savings_goals
for update to authenticated using (public.is_owner(user_id)) with check (public.is_owner(user_id));
create policy savings_goals_delete_own on public.savings_goals
for delete to authenticated using (public.is_owner(user_id));

-- Exact aggregate RPCs ------------------------------------------------------
-- All monetary values returned through JSON are text. The functions are
-- SECURITY INVOKER and also scope every relation explicitly to auth.uid().
create or replace function public.get_account_balances()
returns table (
  account_id uuid,
  user_id uuid,
  name text,
  type text,
  opening_balance text,
  is_archived boolean,
  created_at timestamptz,
  updated_at timestamptz,
  total_income text,
  total_expense text,
  current_balance text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    account.id as account_id,
    account.user_id,
    account.name,
    account.type,
    account.opening_balance::numeric(14,2)::text as opening_balance,
    account.is_archived,
    account.created_at,
    account.updated_at,
    coalesce(
      sum(transaction.amount) filter (
        where transaction.deleted_at is null and transaction.type = 'income'
      ),
      0::numeric
    )::numeric(30,2)::text as total_income,
    coalesce(
      sum(transaction.amount) filter (
        where transaction.deleted_at is null and transaction.type = 'expense'
      ),
      0::numeric
    )::numeric(30,2)::text as total_expense,
    (
      account.opening_balance
      + coalesce(sum(
          case transaction.type
            when 'income' then transaction.amount
            else -transaction.amount
          end
        ) filter (where transaction.deleted_at is null), 0::numeric)
    )::numeric(30,2)::text as current_balance
  from public.accounts account
  left join public.transactions transaction
    on transaction.account_id = account.id
   and transaction.user_id = account.user_id
  where account.user_id = (select auth.uid())
  group by account.id;
$$;

create or replace function public.get_budgets_with_usage()
returns table (
  id uuid,
  user_id uuid,
  category_id uuid,
  period_start date,
  period_end date,
  amount text,
  created_at timestamptz,
  updated_at timestamptz,
  category_name text,
  category_color text,
  category_icon text,
  category_is_archived boolean,
  used text,
  remaining text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    budget.id,
    budget.user_id,
    budget.category_id,
    budget.period_start,
    budget.period_end,
    budget.amount::numeric(14,2)::text,
    budget.created_at,
    budget.updated_at,
    category.name,
    category.color,
    category.icon,
    category.is_archived,
    usage.used::numeric(30,2)::text,
    (budget.amount - usage.used)::numeric(30,2)::text
  from public.budgets budget
  join public.categories category
    on category.id = budget.category_id
   and category.user_id = budget.user_id
  cross join lateral (
    select coalesce(sum(transaction.amount), 0::numeric) as used
    from public.transactions transaction
    where transaction.user_id = budget.user_id
      and transaction.category_id = budget.category_id
      and transaction.type = 'expense'
      and transaction.deleted_at is null
      and transaction.transaction_date between budget.period_start and budget.period_end
  ) usage
  where budget.user_id = (select auth.uid())
  order by budget.period_start desc, category.name;
$$;

create or replace function public.get_dashboard_summary(p_start date, p_end date)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with
  opening_total as (
    select coalesce(sum(opening_balance), 0::numeric) as amount
    from public.accounts
    where user_id = (select auth.uid())
  ),
  all_transaction_flow as (
    select coalesce(sum(
      case type when 'income' then amount else -amount end
    ), 0::numeric) as amount
    from public.transactions
    where user_id = (select auth.uid())
      and deleted_at is null
  ),
  period_totals as (
    select
      coalesce(sum(amount) filter (where type = 'income'), 0::numeric) as income,
      coalesce(sum(amount) filter (where type = 'expense'), 0::numeric) as expense
    from public.transactions
    where user_id = (select auth.uid())
      and deleted_at is null
      and transaction_date between p_start and p_end
      and p_start <= p_end
  ),
  daily_rows as (
    select
      transaction_date,
      coalesce(sum(amount) filter (where type = 'income'), 0::numeric) as income,
      coalesce(sum(amount) filter (where type = 'expense'), 0::numeric) as expense
    from public.transactions
    where user_id = (select auth.uid())
      and deleted_at is null
      and transaction_date between p_start and p_end
      and p_start <= p_end
    group by transaction_date
  ),
  trend_json as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'date', transaction_date::text,
          'income', income::numeric(30,2)::text,
          'expense', expense::numeric(30,2)::text
        ) order by transaction_date
      ),
      '[]'::jsonb
    ) as value
    from daily_rows
  ),
  category_rows as (
    select
      category.id as category_id,
      category.name,
      category.color,
      sum(transaction.amount) as total
    from public.transactions transaction
    join public.categories category
      on category.id = transaction.category_id
     and category.user_id = transaction.user_id
    where transaction.user_id = (select auth.uid())
      and transaction.deleted_at is null
      and transaction.type = 'expense'
      and transaction.transaction_date between p_start and p_end
      and p_start <= p_end
    group by category.id, category.name, category.color
  ),
  categories_json as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'category_id', category_id,
          'name', name,
          'color', color,
          'total', total::numeric(30,2)::text
        ) order by total desc, name
      ),
      '[]'::jsonb
    ) as value
    from category_rows
  ),
  recent_json as (
    select coalesce(jsonb_agg(recent.item order by recent.transaction_date desc, recent.created_at desc), '[]'::jsonb) as value
    from (
      select
        transaction.transaction_date,
        transaction.created_at,
        jsonb_build_object(
          'id', transaction.id,
          'type', transaction.type,
          'amount', transaction.amount::numeric(14,2)::text,
          'transaction_date', transaction.transaction_date::text,
          'description', transaction.description,
          'category_name', category.name,
          'category_color', category.color,
          'account_name', account.name
        ) as item
      from public.transactions transaction
      join public.categories category
        on category.id = transaction.category_id
       and category.user_id = transaction.user_id
      join public.accounts account
        on account.id = transaction.account_id
       and account.user_id = transaction.user_id
      where transaction.user_id = (select auth.uid())
        and transaction.deleted_at is null
      order by transaction.transaction_date desc, transaction.created_at desc
      limit 5
    ) recent
  ),
  budget_rows as (
    select
      budget.id,
      budget.category_id,
      category.name as category_name,
      budget.amount,
      coalesce((
        select sum(transaction.amount)
        from public.transactions transaction
        where transaction.user_id = budget.user_id
          and transaction.category_id = budget.category_id
          and transaction.type = 'expense'
          and transaction.deleted_at is null
          and transaction.transaction_date between budget.period_start and budget.period_end
      ), 0::numeric) as used
    from public.budgets budget
    join public.categories category
      on category.id = budget.category_id
     and category.user_id = budget.user_id
    where budget.user_id = (select auth.uid())
      and budget.period_start <= p_end
      and budget.period_end >= p_start
      and p_start <= p_end
  ),
  budgets_json as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'category_id', category_id,
          'category_name', category_name,
          'amount', amount::numeric(14,2)::text,
          'used', used::numeric(30,2)::text
        ) order by category_name
      ),
      '[]'::jsonb
    ) as value
    from budget_rows
  )
  select jsonb_build_object(
    'total_balance', (opening_total.amount + all_transaction_flow.amount)::numeric(30,2)::text,
    'period_income', period_totals.income::numeric(30,2)::text,
    'period_expense', period_totals.expense::numeric(30,2)::text,
    'net_cash_flow', (period_totals.income - period_totals.expense)::numeric(30,2)::text,
    'trend', trend_json.value,
    'expenses_by_category', categories_json.value,
    'recent_transactions', recent_json.value,
    'budgets', budgets_json.value
  )
  from opening_total
  cross join all_transaction_flow
  cross join period_totals
  cross join trend_json
  cross join categories_json
  cross join recent_json
  cross join budgets_json;
$$;

create or replace function public.get_report_summary(p_start date, p_end date)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with
  period_transactions as (
    select *
    from public.transactions
    where user_id = (select auth.uid())
      and deleted_at is null
      and transaction_date between p_start and p_end
      and p_start <= p_end
  ),
  totals as (
    select
      coalesce(sum(amount) filter (where type = 'income'), 0::numeric) as income,
      coalesce(sum(amount) filter (where type = 'expense'), 0::numeric) as expense
    from period_transactions
  ),
  trend_rows as (
    select
      date_trunc('month', transaction_date)::date as month_start,
      coalesce(sum(amount) filter (where type = 'income'), 0::numeric) as income,
      coalesce(sum(amount) filter (where type = 'expense'), 0::numeric) as expense
    from period_transactions
    group by date_trunc('month', transaction_date)::date
  ),
  trend_json as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'month', to_char(month_start, 'YYYY-MM'),
          'income', income::numeric(30,2)::text,
          'expense', expense::numeric(30,2)::text
        ) order by month_start
      ),
      '[]'::jsonb
    ) as value
    from trend_rows
  ),
  category_rows as (
    select
      category.id as category_id,
      category.name,
      category.color,
      sum(transaction.amount) as total
    from period_transactions transaction
    join public.categories category
      on category.id = transaction.category_id
     and category.user_id = transaction.user_id
    where transaction.type = 'expense'
    group by category.id, category.name, category.color
  ),
  categories_json as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'category_id', category_id,
          'name', name,
          'color', color,
          'total', total::numeric(30,2)::text
        ) order by total desc, name
      ),
      '[]'::jsonb
    ) as value
    from category_rows
  ),
  account_rows as (
    select
      account.id as account_id,
      account.name,
      coalesce(sum(transaction.amount) filter (where transaction.type = 'income'), 0::numeric) as income,
      coalesce(sum(transaction.amount) filter (where transaction.type = 'expense'), 0::numeric) as expense
    from public.accounts account
    left join period_transactions transaction
      on transaction.account_id = account.id
     and transaction.user_id = account.user_id
    where account.user_id = (select auth.uid())
    group by account.id, account.name
  ),
  accounts_json as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'account_id', account_id,
          'name', name,
          'income', income::numeric(30,2)::text,
          'expense', expense::numeric(30,2)::text,
          'net', (income - expense)::numeric(30,2)::text
        ) order by name
      ),
      '[]'::jsonb
    ) as value
    from account_rows
  )
  select jsonb_build_object(
    'income', totals.income::numeric(30,2)::text,
    'expense', totals.expense::numeric(30,2)::text,
    'net', (totals.income - totals.expense)::numeric(30,2)::text,
    'trend', trend_json.value,
    'categories', categories_json.value,
    'accounts', accounts_json.value
  )
  from totals
  cross join trend_json
  cross join categories_json
  cross join accounts_json;
$$;

revoke all on function public.get_account_balances() from public, anon;
revoke all on function public.get_budgets_with_usage() from public, anon;
revoke all on function public.get_dashboard_summary(date, date) from public, anon;
revoke all on function public.get_report_summary(date, date) from public, anon;
grant execute on function public.get_account_balances() to authenticated, service_role;
grant execute on function public.get_budgets_with_usage() to authenticated, service_role;
grant execute on function public.get_dashboard_summary(date, date) to authenticated, service_role;
grant execute on function public.get_report_summary(date, date) to authenticated, service_role;

-- Private receipt storage ---------------------------------------------------
-- Receipt uploads are security-sensitive. A Supabase deployment must have the
-- Storage catalog available and grant the migration role enough authority to
-- secure both the bucket and its object policies; otherwise migration aborts.
do $storage$
begin
  if to_regclass('storage.buckets') is null
     or to_regclass('storage.objects') is null then
    raise exception 'Supabase Storage tables are required to secure receipt uploads';
  end if;

  insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
  )
  values (
    'receipts',
    'receipts',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
  )
  on conflict (id) do update set
    name = excluded.name,
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

  execute 'drop policy if exists receipts_select_own on storage.objects';
  execute 'drop policy if exists receipts_insert_own on storage.objects';
  execute 'drop policy if exists receipts_update_own on storage.objects';
  execute 'drop policy if exists receipts_delete_own on storage.objects';

  execute $policy$
    create policy receipts_select_own on storage.objects
    for select to authenticated
    using (
      bucket_id = 'receipts'
      and split_part(name, '/', 1) = (select auth.uid())::text
    )
  $policy$;
  execute $policy$
    create policy receipts_insert_own on storage.objects
    for insert to authenticated
    with check (
      bucket_id = 'receipts'
      and split_part(name, '/', 1) = (select auth.uid())::text
    )
  $policy$;
  execute $policy$
    create policy receipts_update_own on storage.objects
    for update to authenticated
    using (
      bucket_id = 'receipts'
      and split_part(name, '/', 1) = (select auth.uid())::text
    )
    with check (
      bucket_id = 'receipts'
      and split_part(name, '/', 1) = (select auth.uid())::text
    )
  $policy$;
  execute $policy$
    create policy receipts_delete_own on storage.objects
    for delete to authenticated
    using (
      bucket_id = 'receipts'
      and split_part(name, '/', 1) = (select auth.uid())::text
    )
  $policy$;

  if not exists (
    select 1
    from storage.buckets bucket
    where bucket.id = 'receipts'
      and bucket.public = false
      and bucket.file_size_limit = 5242880
      and bucket.allowed_mime_types =
        array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
  ) then
    raise exception 'Receipt bucket security configuration could not be verified';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_class relation
    join pg_catalog.pg_namespace namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'storage'
      and relation.relname = 'objects'
      and relation.relrowsecurity = true
  ) then
    raise exception 'Row Level Security must be enabled on storage.objects';
  end if;

  if (
    select count(*)
    from pg_catalog.pg_policies policy
    where policy.schemaname = 'storage'
      and policy.tablename = 'objects'
      and policy.policyname in (
        'receipts_select_own',
        'receipts_insert_own',
        'receipts_update_own',
        'receipts_delete_own'
      )
  ) <> 4 then
    raise exception 'Receipt object policies could not be verified';
  end if;
end;
$storage$;

commit;
