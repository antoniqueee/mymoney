import { brandConfig } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";
import { transactionFilterSchema, type TransactionFilters } from "./schema";
import type { TransactionOption, TransactionRecord } from "./types";

const TRANSACTIONS_PER_PAGE = 250;

const transactionSelect = `
  id,
  type,
  amount,
  account_id,
  category_id,
  transaction_date,
  payment_method,
  description,
  attachment_path,
  deleted_at,
  created_at,
  updated_at,
  category:categories!transactions_category_owner_type_fkey(id,name,type,color,icon,is_archived),
  account:accounts!transactions_account_owner_fkey(id,name,type,is_archived)
`;

interface TransactionOptionsQuery {
  includeArchived?: boolean;
  includeArchivedIds?: {
    categoryId?: string | null;
    accountId?: string | null;
  };
}

async function loadTransactionOptions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const [categoryResult, accountResult, profileResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name,type,color,icon,is_archived")
      .eq("user_id", userId)
      .order("is_archived")
      .order("type")
      .order("name"),
    supabase
      .from("accounts")
      .select("id,name,type,is_archived")
      .eq("user_id", userId)
      .order("is_archived")
      .order("name"),
    supabase
      .from("profiles")
      .select("currency_code")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  return { categoryResult, accountResult, profileResult };
}

export async function getTransactionOptions(options: TransactionOptionsQuery = {}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      categories: [],
      accounts: [],
      currencyCode: brandConfig.defaultCurrency,
      error: "Sesi Anda telah berakhir. Silakan masuk kembali.",
    };
  }

  let results = await loadTransactionOptions(supabase, user.id);
  let setupError: string | null = null;

  const financeSetupIsMissing =
    !results.categoryResult.error &&
    !results.accountResult.error &&
    !results.profileResult.error &&
    (results.categoryResult.data?.length === 0 ||
      results.accountResult.data?.length === 0 ||
      !results.profileResult.data);

  if (financeSetupIsMissing) {
    const { error } = await supabase.rpc("ensure_current_user_finance");
    setupError = error?.message ?? null;

    if (!error) {
      results = await loadTransactionOptions(supabase, user.id);
    }
  }

  const { data: categories, error: categoryError } = results.categoryResult;
  const { data: accounts, error: accountError } = results.accountResult;
  const { data: profile, error: profileError } = results.profileResult;

  const visibleCategories = options.includeArchived
    ? categories ?? []
    : (categories ?? []).filter(
        (item) =>
          !item.is_archived ||
          item.id === options.includeArchivedIds?.categoryId,
      );
  const visibleAccounts = options.includeArchived
    ? accounts ?? []
    : (accounts ?? []).filter(
        (item) =>
          !item.is_archived || item.id === options.includeArchivedIds?.accountId,
      );

  return {
    categories: visibleCategories as TransactionOption[],
    accounts: visibleAccounts as TransactionOption[],
    currencyCode: profile?.currency_code ?? brandConfig.defaultCurrency,
    error:
      categoryError?.message ??
      accountError?.message ??
      profileError?.message ??
      (setupError
        ? "Data awal akun dan kategori belum dapat disiapkan. Pastikan migration database terbaru sudah diterapkan."
        : null) ??
      null,
  };
}

export async function getTransactions(
  rawFilters: Partial<TransactionFilters> | Record<string, string | undefined>,
) {
  const parsed = transactionFilterSchema.safeParse(rawFilters);
  const filters = parsed.success ? parsed.data : transactionFilterSchema.parse({});
  const supabase = await createClient();

  let query = supabase
    .from("transactions")
    .select(transactionSelect, { count: "exact" })
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  query = filters.trash === "true"
    ? query.not("deleted_at", "is", null)
    : query.is("deleted_at", null);

  if (filters.start) query = query.gte("transaction_date", filters.start);
  if (filters.end) query = query.lte("transaction_date", filters.end);
  if (filters.type !== "all") query = query.eq("type", filters.type);
  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.account) query = query.eq("account_id", filters.account);
  if (filters.search) {
    const safeSearch = filters.search.replace(/[%,()]/g, " ").trim();
    if (safeSearch) query = query.ilike("description", `%${safeSearch}%`);
  }

  const from = (filters.page - 1) * TRANSACTIONS_PER_PAGE;
  const to = from + TRANSACTIONS_PER_PAGE - 1;
  const { data, error, count } = await query.range(from, to);
  const totalCount = count ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / TRANSACTIONS_PER_PAGE),
  );

  return {
    transactions: (data ?? []) as unknown as TransactionRecord[],
    filters,
    pagination: {
      page: filters.page,
      pageSize: TRANSACTIONS_PER_PAGE,
      totalCount,
      totalPages,
    },
    error: error?.message ?? (!parsed.success ? "Filter tidak valid dan telah direset." : null),
  };
}

export async function getTransaction(id: string) {
  const supabase = await createClient();
  const [transactionResult, profileResult] = await Promise.all([
    supabase
      .from("transactions")
      .select(transactionSelect)
      .eq("id", id)
      .maybeSingle(),
    supabase.from("profiles").select("currency_code").maybeSingle(),
  ]);
  const { data, error } = transactionResult;

  let attachmentUrl: string | null = null;
  const record = data as unknown as TransactionRecord | null;
  if (record?.attachment_path) {
    const { data: signed } = await supabase.storage
      .from("receipts")
      .createSignedUrl(record.attachment_path, 60 * 10);
    attachmentUrl = signed?.signedUrl ?? null;
  }

  return {
    transaction: record,
    attachmentUrl,
    currencyCode: profileResult.data?.currency_code ?? brandConfig.defaultCurrency,
    error: error?.message ?? profileResult.error?.message ?? null,
  };
}
