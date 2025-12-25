/**
 * Transaction Service
 * Business logic for transaction management
 */

import connectDB from "@/lib/db/mongodb";
import Transaction from "@/models/Transaction";
import { categorizeTransaction } from "@/lib/ai/client";
import { ITransaction, TransactionFilters, DashboardStats } from "@/types";

export class TransactionService {
  /**
   * Create a new transaction with optional AI categorization
   */
  static async createTransaction(
    data: Partial<ITransaction>,
    useAI = true
  ): Promise<ITransaction> {
    await connectDB();

    let category = data.category || "Other";
    let aiCategorized = data.aiCategorized || false;
    let aiConfidence: number | undefined = data.aiConfidence;

    // Use AI to categorize if no category provided and AI is enabled
    if (useAI && !data.category && data.description) {
      try {
        const result = await categorizeTransaction({
          description: data.description,
          amount: data.amount || 0,
          merchant: data.merchant,
          date: data.date,
        });

        category = result.category;
        aiCategorized = true;
        aiConfidence = result.confidence;
      } catch (error) {
        console.error("AI categorization failed, using default:", error);
      }
    }

    const transaction = await Transaction.create({
      ...data,
      category,
      aiCategorized,
      aiConfidence,
      date: data.date || new Date(),
    });

    return transaction.toObject();
  }

  /**
   * Get all transactions for a user
   */
  static async getTransactionsByUser(userId: string): Promise<ITransaction[]> {
    await connectDB();
    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .lean();
    return transactions;
  }

  /**
   * Get transactions with filters
   */
  static async getTransactions(
    userId: string,
    filters: TransactionFilters = {}
  ): Promise<ITransaction[]> {
    await connectDB();

    const query: any = { userId };

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }

    if (filters.category) query.category = filters.category;
    if (filters.type) query.type = filters.type;

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      query.amount = {};
      if (filters.minAmount !== undefined) query.amount.$gte = filters.minAmount;
      if (filters.maxAmount !== undefined) query.amount.$lte = filters.maxAmount;
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .lean();

    return transactions;
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(
    id: string,
    userId: string
  ): Promise<ITransaction | null> {
    await connectDB();
    const transaction = await Transaction.findOne({ _id: id, userId }).lean();
    return transaction;
  }

  /**
   * Update a transaction
   */
  static async updateTransaction(
    id: string,
    userId: string,
    data: Partial<ITransaction>
  ): Promise<ITransaction | null> {
    await connectDB();

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true }
    ).lean();

    return transaction;
  }

  /**
   * Delete a transaction
   */
  static async deleteTransaction(
    id: string,
    userId: string
  ): Promise<boolean> {
    await connectDB();
    const result = await Transaction.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    await connectDB();

    const transactions = await Transaction.find({ userId }).lean();

    const stats: DashboardStats = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      transactionCount: transactions.length,
      topCategories: [],
    };

    const categoryMap = new Map<string, number>();

    transactions.forEach((t) => {
      if (t.type === "income") {
        stats.totalIncome += t.amount;
      } else {
        stats.totalExpenses += t.amount;
        // Track expense categories
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      }
    });

    stats.balance = stats.totalIncome - stats.totalExpenses;

    // Calculate top categories
    const categoryArray = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: stats.totalExpenses > 0 ? (amount / stats.totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    stats.topCategories = categoryArray;

    return stats;
  }

  /**
   * Get transactions with pagination
   */
  static async getTransactionsPaginated(
    filter: any,
    page: number,
    limit: number
  ): Promise<{
    transactions: ITransaction[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  }> {
    await connectDB();

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      transactions,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Get unique categories for filtered transactions
   */
  static async getUniqueCategories(filter: any): Promise<string[]> {
    await connectDB();

    const categories = await Transaction.distinct("category", filter);

    // Sort alphabetically
    return categories.sort();
  }
}
