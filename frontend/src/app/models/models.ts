export type TransactionType = 'income' | 'expense';

export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  user_id: number;
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  notes?: string;
  type: TransactionType;
  date: string;
  user_id: number;
  category_id?: number;
  category?: Category;
  created_at: string;
}

export interface TransactionCreate {
  amount: number;
  description: string;
  notes?: string;
  type: TransactionType;
  date: string;
  category_id?: number;
}

export interface TransactionUpdate {
  amount?: number;
  description?: string;
  notes?: string;
  date?: string;
  category_id?: number;
}

export interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Budget {
  id: number;
  amount: number;
  month: number;
  year: number;
  category_id?: number;
  category?: Category;
  user_id: number;
  created_at: string;
}

export interface BudgetCreate {
  amount: number;
  month: number;
  year: number;
  category_id?: number;
}

export interface MonthlySummary {
  month: number;
  year: number;
  total_income: number;
  total_expenses: number;
  balance: number;
  transaction_count: number;
}

export interface CategorySummary {
  category_id?: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  total: number;
  count: number;
  percentage: number;
}

export interface DailySummary {
  date: string;
  income: number;
  expenses: number;
}

export interface ReportResponse {
  monthly_summary: MonthlySummary;
  by_category: CategorySummary[];
  daily_trend: DailySummary[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
