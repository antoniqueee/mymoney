"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Category, TransactionType } from "@/types/transaction";

export function useCategories(typeFilter?: TransactionType) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (typeFilter) {
        query = query.eq("type", typeFilter);
      }

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      setCategories((data as Category[]) || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, supabase]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}
