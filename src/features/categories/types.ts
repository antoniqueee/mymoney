import type { Database } from "@/types/database.types";
import type { CategoryFormValues } from "@/lib/validations/category";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export type CategoryRecord = Pick<
  CategoryRow,
  | "id"
  | "name"
  | "type"
  | "color"
  | "icon"
  | "is_default"
  | "is_archived"
  | "created_at"
  | "updated_at"
>;

export type CategoryFieldErrors = Partial<
  Record<keyof CategoryFormValues, string[]>
>;

export type CategoryActionResult =
  | { success: true; message: string }
  | {
      success: false;
      message: string;
      fieldErrors?: CategoryFieldErrors;
    };

export type CategoriesQueryResult =
  | { data: CategoryRecord[]; error: null }
  | { data: []; error: string };
