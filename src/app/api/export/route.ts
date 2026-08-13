import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const querySchema = z
  .object({
    format: z.enum(["csv", "json"]).default("csv"),
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })
  .refine(({ start, end }) => !start || !end || start <= end, {
    message: "Tanggal akhir harus sama dengan atau setelah tanggal mulai.",
  });

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function allRows<T>(fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const rows: T[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await fetchPage(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    const page = data ?? [];
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

interface ExportTransaction {
  id: string;
  account_id: string;
  category_id: string;
  transaction_date: string;
  type: string;
  amount: string | number;
  payment_method: string;
  description: string | null;
  attachment_path: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  category: { name: string } | null;
  account: { name: string } | null;
}

async function exportTransactions(
  supabase: SupabaseServerClient,
  start?: string,
  end?: string,
  includeDeleted = false,
) {
  return allRows<{
    id: string; account_id: string; category_id: string; transaction_date: string; type: string;
    amount: string | number; payment_method: string; description: string | null;
    attachment_path: string | null; deleted_at: string | null; created_at: string; updated_at: string;
    category: { name: string } | null; account: { name: string } | null;
  }>((from, to) => {
    let query = supabase
      .from("transactions")
      .select("id,account_id,category_id,transaction_date,type,amount,payment_method,description,attachment_path,deleted_at,created_at,updated_at,category:categories(name),account:accounts(name)")
      .order("transaction_date", { ascending: false })
      .order("id", { ascending: true })
      .range(from, to);
    if (!includeDeleted) query = query.is("deleted_at", null);
    if (start) query = query.gte("transaction_date", start);
    if (end) query = query.lte("transaction_date", end);
    return query as unknown as PromiseLike<{
      data: ExportTransaction[] | null;
      error: { message: string } | null;
    }>;
  });
}

function csvCell(value: string | number | null) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  const url = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Parameter ekspor tidak valid" }, { status: 400 });

  try {
    const date = new Date().toISOString().slice(0, 10);
    if (parsed.data.format === "csv") {
      const transactions = await exportTransactions(supabase, parsed.data.start, parsed.data.end);
      const header = ["ID", "Tanggal", "Tipe", "Kategori", "Akun", "Jumlah", "Metode", "Deskripsi"];
      const lines = transactions.map((item) => [item.id, item.transaction_date, item.type, item.category?.name ?? "", item.account?.name ?? "", item.amount, item.payment_method, item.description].map(csvCell).join(","));
      const content = `\uFEFF${header.map(csvCell).join(",")}\r\n${lines.join("\r\n")}`;
      return new NextResponse(content, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="my-money-${date}.csv"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
    }

    const [profileResult, accounts, categories, transactions, budgets, savingsGoals] = await Promise.all([
      supabase.from("profiles").select("id,email,full_name,avatar_url,currency_code,theme,created_at,updated_at").maybeSingle(),
      allRows((from, to) => supabase.from("accounts").select("id,name,type,opening_balance,is_archived,created_at,updated_at").order("created_at").order("id").range(from, to)),
      allRows((from, to) => supabase.from("categories").select("id,name,type,color,icon,is_default,is_archived,created_at,updated_at").order("created_at").order("id").range(from, to)),
      exportTransactions(supabase, parsed.data.start, parsed.data.end, true),
      allRows((from, to) => supabase.from("budgets").select("id,category_id,period_start,period_end,amount,created_at,updated_at").order("period_start").order("id").range(from, to)),
      allRows((from, to) => supabase.from("savings_goals").select("id,name,target_amount,current_amount,deadline,status,created_at,updated_at").order("created_at").order("id").range(from, to)),
    ]);
    if (profileResult.error) throw new Error(profileResult.error.message);
    const backup = {
      application: "My Money",
      version: 1,
      exported_at: new Date().toISOString(),
      period: { start: parsed.data.start ?? null, end: parsed.data.end ?? null },
      profile: profileResult.data,
      accounts,
      categories,
      transactions,
      budgets,
      savings_goals: savingsGoals,
      attachment_manifest: transactions
        .filter((transaction) => transaction.attachment_path)
        .map((transaction) => ({ transaction_id: transaction.id, storage_bucket: "receipts", path: transaction.attachment_path })),
    };
    return new NextResponse(JSON.stringify(backup, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="my-money-backup-${date}.json"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return NextResponse.json({ error: "Ekspor gagal dibuat. Coba kembali." }, { status: 500 });
  }
}
