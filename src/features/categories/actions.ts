"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import {
  categoryIdSchema,
  categorySchema,
} from "@/lib/validations/category";
import type {
  CategoryActionResult,
  CategoryFieldErrors,
} from "@/features/categories/types";

const categoryArchiveSchema = z.object({
  id: categoryIdSchema,
  is_archived: z.boolean(),
});

function validationError(
  fieldErrors: CategoryFieldErrors,
): CategoryActionResult {
  return {
    success: false,
    message: "Periksa kembali data kategori Anda.",
    fieldErrors,
  };
}

function mutationError(code: string | undefined): CategoryActionResult {
  if (code === "23505") {
    return {
      success: false,
      message: "Nama kategori tersebut sudah digunakan untuk jenis yang sama.",
    };
  }

  return {
    success: false,
    message: "Perubahan kategori belum dapat disimpan. Silakan coba lagi.",
  };
}

async function authenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function createCategoryAction(
  input: unknown,
): Promise<CategoryActionResult> {
  const parsed = categorySchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const { supabase, user } = await authenticatedClient();

  if (!user) {
    return { success: false, message: "Sesi Anda telah berakhir." };
  }

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: parsed.data.name,
    type: parsed.data.type,
    color: parsed.data.color.toLowerCase(),
    icon: parsed.data.icon,
    is_default: false,
    is_archived: false,
  });

  if (error) {
    return mutationError(error.code);
  }

  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/budgets");

  return { success: true, message: "Kategori berhasil dibuat." };
}

export async function updateCategoryAction(
  id: unknown,
  input: unknown,
): Promise<CategoryActionResult> {
  const parsedId = categoryIdSchema.safeParse(id);
  const parsed = categorySchema.safeParse(input);

  if (!parsedId.success) {
    return { success: false, message: "Kategori tidak valid." };
  }

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const { supabase, user } = await authenticatedClient();

  if (!user) {
    return { success: false, message: "Sesi Anda telah berakhir." };
  }

  // Category type is intentionally immutable after creation so historical
  // transaction semantics cannot be changed by an edit.
  const { data, error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      color: parsed.data.color.toLowerCase(),
      icon: parsed.data.icon,
    })
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return mutationError(error.code);
  }

  if (!data) {
    return { success: false, message: "Kategori tidak ditemukan." };
  }

  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/budgets");

  return { success: true, message: "Kategori berhasil diperbarui." };
}

export async function setCategoryArchivedAction(
  input: unknown,
): Promise<CategoryActionResult> {
  const parsed = categoryArchiveSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: "Permintaan arsip tidak valid." };
  }

  const { supabase, user } = await authenticatedClient();

  if (!user) {
    return { success: false, message: "Sesi Anda telah berakhir." };
  }

  const { data, error } = await supabase
    .from("categories")
    .update({ is_archived: parsed.data.is_archived })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return mutationError(error.code);
  }

  if (!data) {
    return { success: false, message: "Kategori tidak ditemukan." };
  }

  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/budgets");

  return {
    success: true,
    message: parsed.data.is_archived
      ? "Kategori berhasil diarsipkan."
      : "Kategori berhasil dipulihkan.",
  };
}
