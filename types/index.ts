/**
 * Global type definitions for Money App
 */

export interface ITransaction {
  _id?: string;
  userId: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  merchant?: string;
  date: Date;
  aiCategorized: boolean;
  aiConfidence?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICategory {
  _id?: string;
  name: string;
  type: "income" | "expense" | "both";
  icon?: string;
  color?: string;
  isDefault: boolean;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TransactionType = "income" | "expense";

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  type?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  transaction?: ITransaction;
}

export interface ParsedTransaction {
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  merchant?: string;
  confidence: number;
  reasoning?: string;
}
