"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { normalizeMoneyInput } from "@/lib/money";
import {
  budgetIdSchema,
  budgetSchema,
} from "@/lib/validations/budget";
import type {
  BudgetActionResult,
  BudgetFieldErrors,
} from "@/features/budgets/types";

function validationError(
  fieldErrors: BudgetFieldErrors,
): BudgetActionResult {
  return {
    success: false,
    message: "Periksa kembali data anggaran Anda.",
    fieldErrors,
  };
}

function mutationError(code?: string): BudgetActionResult {
  if (code === "23505") {
    return {
      success: false,
      message: "Kategori tersebut sudah memiliki anggaran pada periode yang sama.",
    };
  }

  return {
    success: false,
    message: "Perubahan anggaran belum dapat disimpan. Silakan coba lagi.",
  };
}

async function authenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

async function categoryCanBeBudgeted(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  categoryId: string,
) {
  const { data } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .eq("user_id", userId)
    .eq("type", "expense")
    .eq("is_archived", false)
    .maybeSingle();

  return Boolean(data);
}

export async function createBudgetAction(
  input: unknown,
): Promise<BudgetActionResult> {
  const parsed = budgetSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const { supabase, user } = await authenticatedClient();

  if (!user) {
    return { success: false, message: "Sesi Anda telah berakhir." };
  }

  if (!(await categoryCanBeBudgeted(supabase, user.id, parsed.data.category_id))) {
    return {
      success: false,
      message: "Pilih kategori pengeluaran yang masih aktif.",
      fieldErrors: { category_id: ["Kategori tidak tersedia"] },
    };
  }

  const { error } = await supabase.from("budgets").insert({
    user_id: user.id,
    category_id: parsed.data.category_id,
    period_start: parsed.data.period_start,
    period_end: parsed.data.period_end,
    amount: normalizeMoneyInput(parsed.data.amount),
  });

  if (error) return mutationError(error.code);

  revalidatePath("/budgets");
  revalidatePath("/dashboard");

  return { success: true, message: "Anggaran berhasil dibuat." };
}

export async function updateBudgetAction(
  id: unknown,
  input: unknown,
): Promise<BudgetActionResult> {
  const parsedId = budgetIdSchema.safeParse(id);
  const parsed = budgetSchema.safeParse(input);

  if (!parsedId.success) {
    return { success: false, message: "Anggaran tidak valid." };
  }

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const { supabase, user } = await authenticatedClient();

  if (!user) {
    return { success: false, message: "Sesi Anda telah berakhir." };
  }

  if (!(await categoryCanBeBudgeted(supabase, user.id, parsed.data.category_id))) {
    return {
      success: false,
      message: "Pilih kategori pengeluaran yang masih aktif.",
      fieldErrors: { category_id: ["Kategori tidak tersedia"] },
    };
  }

  const { data, error } = await supabase
    .from("budgets")
    .update({
      category_id: parsed.data.category_id,
      period_start: parsed.data.period_start,
      period_end: parsed.data.period_end,
      amount: normalizeMoneyInput(parsed.data.amount),
    })
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return mutationError(error.code);
  if (!data) return { success: false, message: "Anggaran tidak ditemukan." };

  revalidatePath("/budgets");
  revalidatePath("/dashboard");

  return { success: true, message: "Anggaran berhasil diperbarui." };
}

export async function deleteBudgetAction(
  id: unknown,
): Promise<BudgetActionResult> {
  const parsedId = budgetIdSchema.safeParse(id);

  if (!parsedId.success) {
    return { success: false, message: "Anggaran tidak valid." };
  }

  const { supabase, user } = await authenticatedClient();

  if (!user) {
    return { success: false, message: "Sesi Anda telah berakhir." };
  }

  const { data, error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return mutationError(error.code);
  if (!data) return { success: false, message: "Anggaran tidak ditemukan." };

  revalidatePath("/budgets");
  revalidatePath("/dashboard");

  return { success: true, message: "Anggaran berhasil dihapus." };
}
