"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeMoneyInput } from "@/lib/money";
import { transactionFormSchema, transactionIdSchema } from "./schema";
import type { TransactionActionResult } from "./types";

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { supabase, user };
}

function fieldsFromFormData(formData: FormData) {
  return {
    type: String(formData.get("type") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    category_id: String(formData.get("category_id") ?? ""),
    account_id: String(formData.get("account_id") ?? ""),
    transaction_date: String(formData.get("transaction_date") ?? ""),
    payment_method: String(formData.get("payment_method") ?? ""),
    description: String(formData.get("description") ?? ""),
  };
}

function attachmentFromFormData(formData: FormData) {
  const candidate = formData.get("attachment");
  if (!(candidate instanceof File) || candidate.size === 0) return { file: null, error: null };
  if (candidate.size > MAX_ATTACHMENT_BYTES) {
    return { file: null, error: "Lampiran maksimal 5 MB." };
  }
  if (!ALLOWED_ATTACHMENT_TYPES.has(candidate.type)) {
    return { file: null, error: "Lampiran harus berupa JPG, PNG, WebP, atau PDF." };
  }
  return { file: candidate, error: null };
}

function refreshFinancePaths(id?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
  revalidatePath("/reports");
  revalidatePath("/accounts");
  if (id) revalidatePath(`/transactions/${id}`);
}

async function uploadAttachment(
  supabase: NonNullable<Awaited<ReturnType<typeof getAuthenticatedClient>>>["supabase"],
  userId: string,
  file: File,
) {
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from("receipts")
    .upload(path, bytes, { contentType: file.type, upsert: false });
  return { path: error ? null : path, error: error?.message ?? null };
}

export async function createTransaction(formData: FormData): Promise<TransactionActionResult> {
  const auth = await getAuthenticatedClient();
  if (!auth) return { ok: false, message: "Sesi berakhir. Silakan masuk kembali." };

  const parsed = transactionFormSchema.safeParse(fieldsFromFormData(formData));
  if (!parsed.success) {
    return { ok: false, message: "Periksa kembali isian transaksi.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const attachment = attachmentFromFormData(formData);
  if (attachment.error) return { ok: false, message: attachment.error };

  const [{ data: category }, { data: account }] = await Promise.all([
    auth.supabase
      .from("categories")
      .select("id,type,is_archived")
      .eq("id", parsed.data.category_id)
      .eq("type", parsed.data.type)
      .eq("is_archived", false)
      .maybeSingle(),
    auth.supabase
      .from("accounts")
      .select("id,is_archived")
      .eq("id", parsed.data.account_id)
      .eq("is_archived", false)
      .maybeSingle(),
  ]);
  if (!category) return { ok: false, message: "Kategori tidak tersedia atau tidak sesuai tipe transaksi." };
  if (!account) return { ok: false, message: "Akun tidak tersedia." };

  let attachmentPath: string | null = null;
  if (attachment.file) {
    const uploaded = await uploadAttachment(auth.supabase, auth.user.id, attachment.file);
    if (uploaded.error || !uploaded.path) {
      return { ok: false, message: "Lampiran gagal diunggah. Coba kembali." };
    }
    attachmentPath = uploaded.path;
  }

  const { data, error } = await auth.supabase
    .from("transactions")
    .insert({
      user_id: auth.user.id,
      type: parsed.data.type,
      amount: normalizeMoneyInput(parsed.data.amount),
      category_id: parsed.data.category_id,
      account_id: parsed.data.account_id,
      transaction_date: parsed.data.transaction_date,
      payment_method: parsed.data.payment_method,
      description: parsed.data.description || null,
      attachment_path: attachmentPath,
    })
    .select("id")
    .single();

  if (error) {
    if (attachmentPath) await auth.supabase.storage.from("receipts").remove([attachmentPath]);
    return { ok: false, message: "Transaksi gagal disimpan. Pastikan data masih tersedia." };
  }
  refreshFinancePaths(data.id);
  return { ok: true, message: "Transaksi berhasil disimpan.", transactionId: data.id };
}

export async function updateTransaction(id: string, formData: FormData): Promise<TransactionActionResult> {
  const validId = transactionIdSchema.safeParse(id);
  if (!validId.success) return { ok: false, message: validId.error.issues[0]?.message ?? "ID tidak valid." };
  const auth = await getAuthenticatedClient();
  if (!auth) return { ok: false, message: "Sesi berakhir. Silakan masuk kembali." };
  const parsed = transactionFormSchema.safeParse(fieldsFromFormData(formData));
  if (!parsed.success) {
    return { ok: false, message: "Periksa kembali isian transaksi.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const attachment = attachmentFromFormData(formData);
  if (attachment.error) return { ok: false, message: attachment.error };

  const { data: existing } = await auth.supabase
    .from("transactions")
    .select("id,attachment_path,category_id,account_id")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!existing) return { ok: false, message: "Transaksi tidak ditemukan atau sudah dihapus." };

  let categoryQuery = auth.supabase
    .from("categories")
    .select("id")
    .eq("id", parsed.data.category_id)
    .eq("type", parsed.data.type);
  if (parsed.data.category_id !== existing.category_id) {
    categoryQuery = categoryQuery.eq("is_archived", false);
  }

  let accountQuery = auth.supabase
    .from("accounts")
    .select("id")
    .eq("id", parsed.data.account_id);
  if (parsed.data.account_id !== existing.account_id) {
    accountQuery = accountQuery.eq("is_archived", false);
  }

  const [{ data: category }, { data: account }] = await Promise.all([
    categoryQuery.maybeSingle(),
    accountQuery.maybeSingle(),
  ]);
  if (!category || !account) return { ok: false, message: "Kategori atau akun tidak lagi tersedia." };

  let nextAttachmentPath = existing.attachment_path;
  if (attachment.file) {
    const uploaded = await uploadAttachment(auth.supabase, auth.user.id, attachment.file);
    if (uploaded.error || !uploaded.path) return { ok: false, message: "Lampiran gagal diunggah." };
    nextAttachmentPath = uploaded.path;
  }

  const removeAttachment = formData.get("remove_attachment") === "true";
  if (removeAttachment && !attachment.file) nextAttachmentPath = null;

  const { data: updated, error } = await auth.supabase
    .from("transactions")
    .update({
      type: parsed.data.type,
      amount: normalizeMoneyInput(parsed.data.amount),
      category_id: parsed.data.category_id,
      account_id: parsed.data.account_id,
      transaction_date: parsed.data.transaction_date,
      payment_method: parsed.data.payment_method,
      description: parsed.data.description || null,
      attachment_path: nextAttachmentPath,
    })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error || !updated) {
    if (nextAttachmentPath && nextAttachmentPath !== existing.attachment_path) {
      await auth.supabase.storage.from("receipts").remove([nextAttachmentPath]);
    }
    return { ok: false, message: "Perubahan transaksi gagal disimpan atau transaksi sudah berubah." };
  }
  let cleanupWarning = false;
  if (existing.attachment_path && existing.attachment_path !== nextAttachmentPath) {
    const { error: cleanupError } = await auth.supabase.storage.from("receipts").remove([existing.attachment_path]);
    cleanupWarning = Boolean(cleanupError);
  }
  refreshFinancePaths(id);
  return {
    ok: true,
    message: cleanupWarning
      ? "Transaksi diperbarui, tetapi lampiran lama belum dapat dibersihkan."
      : "Transaksi berhasil diperbarui.",
    transactionId: id,
  };
}

export async function softDeleteTransaction(id: string): Promise<TransactionActionResult> {
  const validId = transactionIdSchema.safeParse(id);
  const auth = await getAuthenticatedClient();
  if (!validId.success || !auth) return { ok: false, message: "Permintaan tidak valid atau sesi berakhir." };
  const { data: deleted, error } = await auth.supabase
    .from("transactions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();
  if (error || !deleted) return { ok: false, message: "Transaksi tidak ditemukan atau sudah berada di sampah." };
  refreshFinancePaths(id);
  return { ok: true, message: "Transaksi dipindahkan ke sampah." };
}

export async function restoreTransaction(id: string): Promise<TransactionActionResult> {
  const validId = transactionIdSchema.safeParse(id);
  const auth = await getAuthenticatedClient();
  if (!validId.success || !auth) return { ok: false, message: "Permintaan tidak valid atau sesi berakhir." };
  const { data: restored, error } = await auth.supabase
    .from("transactions")
    .update({ deleted_at: null })
    .eq("id", id)
    .not("deleted_at", "is", null)
    .select("id")
    .maybeSingle();
  if (error || !restored) return { ok: false, message: "Transaksi tidak ditemukan atau sudah aktif." };
  refreshFinancePaths(id);
  return { ok: true, message: "Transaksi berhasil dipulihkan." };
}
