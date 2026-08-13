"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { normalizeMoneyInput } from "@/lib/money";
import {
  accountIdSchema,
  accountSchema,
} from "@/lib/validations/account";
import type {
  AccountActionResult,
  AccountFieldErrors,
} from "@/features/accounts/types";

const accountArchiveSchema = z.object({
  id: accountIdSchema,
  is_archived: z.boolean(),
});

function validationError(
  fieldErrors: AccountFieldErrors,
): AccountActionResult {
  return {
    success: false,
    message: "Periksa kembali data akun Anda.",
    fieldErrors,
  };
}

function mutationError(code?: string): AccountActionResult {
  if (code === "23505") {
    return {
      success: false,
      message: "Nama akun tersebut sudah digunakan.",
    };
  }

  return {
    success: false,
    message: "Perubahan akun belum dapat disimpan. Silakan coba lagi.",
  };
}

async function authenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function createAccountAction(
  input: unknown,
): Promise<AccountActionResult> {
  const parsed = accountSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const { supabase, user } = await authenticatedClient();

  if (!user) {
    return { success: false, message: "Sesi Anda telah berakhir." };
  }

  const { error } = await supabase.from("accounts").insert({
    user_id: user.id,
    name: parsed.data.name,
    type: parsed.data.type,
    opening_balance: normalizeMoneyInput(parsed.data.opening_balance),
    is_archived: false,
  });

  if (error) return mutationError(error.code);

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");

  return { success: true, message: "Akun berhasil dibuat." };
}

export async function updateAccountAction(
  id: unknown,
  input: unknown,
): Promise<AccountActionResult> {
  const parsedId = accountIdSchema.safeParse(id);
  const parsed = accountSchema.safeParse(input);

  if (!parsedId.success) {
    return { success: false, message: "Akun tidak valid." };
  }

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const { supabase, user } = await authenticatedClient();

  if (!user) {
    return { success: false, message: "Sesi Anda telah berakhir." };
  }

  const { data, error } = await supabase
    .from("accounts")
    .update({
      name: parsed.data.name,
      type: parsed.data.type,
      opening_balance: normalizeMoneyInput(parsed.data.opening_balance),
    })
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return mutationError(error.code);
  if (!data) return { success: false, message: "Akun tidak ditemukan." };

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");

  return { success: true, message: "Akun berhasil diperbarui." };
}

export async function setAccountArchivedAction(
  input: unknown,
): Promise<AccountActionResult> {
  const parsed = accountArchiveSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: "Permintaan arsip tidak valid." };
  }

  const { supabase, user } = await authenticatedClient();

  if (!user) {
    return { success: false, message: "Sesi Anda telah berakhir." };
  }

  const { data, error } = await supabase
    .from("accounts")
    .update({ is_archived: parsed.data.is_archived })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return mutationError(error.code);
  if (!data) return { success: false, message: "Akun tidak ditemukan." };

  revalidatePath("/accounts");
  revalidatePath("/transactions");

  return {
    success: true,
    message: parsed.data.is_archived
      ? "Akun berhasil diarsipkan."
      : "Akun berhasil dipulihkan.",
  };
}
