/**
 * Compatibility export for earlier imports. The canonical transaction schema
 * lives with the feature and keeps money as a decimal string end to end.
 */
export {
  transactionFormSchema as transactionSchema,
  type TransactionFormValues,
} from "@/features/transactions/schema";
