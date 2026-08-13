export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** PostgreSQL numeric(14,2) is kept as text to preserve decimal precision. */
export type DatabaseMoney = string;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          currency_code: "IDR" | "USD" | "SGD";
          theme: "light";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          currency_code?: "IDR" | "USD" | "SGD";
          theme?: "light";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          currency_code?: "IDR" | "USD" | "SGD";
          theme?: "light";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: "cash" | "bank" | "ewallet" | "other";
          opening_balance: DatabaseMoney;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: "cash" | "bank" | "ewallet" | "other";
          opening_balance?: DatabaseMoney;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: "cash" | "bank" | "ewallet" | "other";
          opening_balance?: DatabaseMoney;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: "income" | "expense";
          color: string;
          icon: string;
          is_default: boolean;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: "income" | "expense";
          color?: string;
          icon?: string;
          is_default?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: "income" | "expense";
          color?: string;
          icon?: string;
          is_default?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          category_id: string;
          type: "income" | "expense";
          amount: DatabaseMoney;
          transaction_date: string;
          payment_method:
            | "cash"
            | "debit_card"
            | "credit_card"
            | "bank_transfer"
            | "e_wallet"
            | "other";
          description: string | null;
          attachment_path: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          category_id: string;
          type: "income" | "expense";
          amount: DatabaseMoney;
          transaction_date?: string;
          payment_method?:
            | "cash"
            | "debit_card"
            | "credit_card"
            | "bank_transfer"
            | "e_wallet"
            | "other";
          description?: string | null;
          attachment_path?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          category_id?: string;
          type?: "income" | "expense";
          amount?: DatabaseMoney;
          transaction_date?: string;
          payment_method?:
            | "cash"
            | "debit_card"
            | "credit_card"
            | "bank_transfer"
            | "e_wallet"
            | "other";
          description?: string | null;
          attachment_path?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_account_owner_fkey";
            columns: ["account_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "transactions_category_owner_type_fkey";
            columns: ["category_id", "user_id", "type"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "user_id", "type"];
          },
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          period_start: string;
          period_end: string;
          amount: DatabaseMoney;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          period_start: string;
          period_end: string;
          amount: DatabaseMoney;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          period_start?: string;
          period_end?: string;
          amount?: DatabaseMoney;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budgets_category_owner_fkey";
            columns: ["category_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "budgets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      savings_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: DatabaseMoney;
          current_amount: DatabaseMoney;
          deadline: string | null;
          status: "active" | "paused" | "completed" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: DatabaseMoney;
          current_amount?: DatabaseMoney;
          deadline?: string | null;
          status?: "active" | "paused" | "completed" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount?: DatabaseMoney;
          current_amount?: DatabaseMoney;
          deadline?: string | null;
          status?: "active" | "paused" | "completed" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "savings_goals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_account_balances: {
        Args: Record<PropertyKey, never>;
        Returns: {
          account_id: string;
          user_id: string;
          name: string;
          type: "cash" | "bank" | "ewallet" | "other";
          opening_balance: DatabaseMoney;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
          total_income: DatabaseMoney;
          total_expense: DatabaseMoney;
          current_balance: DatabaseMoney;
        }[];
      };
      get_budgets_with_usage: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          user_id: string;
          category_id: string;
          period_start: string;
          period_end: string;
          amount: DatabaseMoney;
          created_at: string;
          updated_at: string;
          category_name: string;
          category_color: string;
          category_icon: string;
          category_is_archived: boolean;
          used: DatabaseMoney;
          remaining: DatabaseMoney;
        }[];
      };
      get_dashboard_summary: {
        Args: { p_start: string; p_end: string };
        Returns: Json;
      };
      get_report_summary: {
        Args: { p_start: string; p_end: string };
        Returns: Json;
      };
      is_owner: {
        Args: { owner_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends { Insert: infer I }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends { Update: infer U }
      ? U
      : never
    : never;
