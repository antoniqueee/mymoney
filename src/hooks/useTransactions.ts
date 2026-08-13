"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Transaction, TransactionFilter } from "@/types/transaction";

export function useTransactions(initialFilter?: TransactionFilter) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TransactionFilter>(initialFilter || {});

  const supabase = useMemo(() => createClient(), []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("transactions")
        .select("*, category:categories(*), account:accounts(*)")
        .order("transaction_date", { ascending: false });

      query = filter.includeDeleted
        ? query.not("deleted_at", "is", null)
        : query.is("deleted_at", null);

      if (filter.type && filter.type !== "all") {
        query = query.eq("type", filter.type);
      }
      if (filter.categoryId) {
        query = query.eq("category_id", filter.categoryId);
      }
      if (filter.startDate) {
        query = query.gte("transaction_date", filter.startDate);
      }
      if (filter.endDate) {
        query = query.lte("transaction_date", filter.endDate);
      }
      if (filter.accountId) query = query.eq("account_id", filter.accountId);
      if (filter.search?.trim()) query = query.ilike("description", `%${filter.search.trim().replace(/[%,()]/g, " ")}%`);

      const { data, error: fetchErr } = await query;

      if (fetchErr) throw fetchErr;

      setTransactions((data as unknown as Transaction[]) || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  }, [filter, supabase]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    filter,
    setFilter,
    refetch: fetchTransactions,
  };
}
