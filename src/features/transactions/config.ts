import type { PaymentMethod } from "./schema";
import type { TransactionType } from "./types";

export const transactionTypeLabels: Record<TransactionType, string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Tunai",
  debit_card: "Kartu debit",
  credit_card: "Kartu kredit",
  bank_transfer: "Transfer bank",
  e_wallet: "E-wallet",
  other: "Lainnya",
};

