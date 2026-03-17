export type ExpenseCategory = 'food' | 'travel' | 'rent' | 'shopping' | 'bills' | 'others';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  notes?: string;
  isGroupExpense?: boolean;
  groupName?: string;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'add' | 'deduct';
  description: string;
  date: string;
}

export interface SavingsGameCell {
  id: number;
  value: 100 | 200 | 500;
  completed: boolean;
  completedDate?: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  monthlySalary?: number;
  fixedExpenses?: number;
  variableExpenses?: number;
  monthlySavingTarget?: number;
  dailySavingTarget?: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  walletBalance: number;
}

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: 'hsl(var(--category-food))',
  travel: 'hsl(var(--category-travel))',
  rent: 'hsl(var(--category-rent))',
  shopping: 'hsl(var(--category-shopping))',
  bills: 'hsl(var(--category-bills))',
  others: 'hsl(var(--category-others))',
};

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: 'Food',
  travel: 'Travel',
  rent: 'Rent',
  shopping: 'Shopping',
  bills: 'Bills',
  others: 'Others',
};

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  food: '🍔',
  travel: '✈️',
  rent: '🏠',
  shopping: '🛍️',
  bills: '📄',
  others: '📦',
};
