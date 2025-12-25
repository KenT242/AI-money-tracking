/**
 * Category Service
 * Business logic for category management
 */

import connectDB from "@/lib/db/mongodb";
import Category from "@/models/Category";
import { ICategory } from "@/types";

export class CategoryService {
  /**
   * Get all categories for a user (including default categories)
   */
  static async getCategories(userId?: string): Promise<ICategory[]> {
    await connectDB();

    const query = userId
      ? { $or: [{ userId }, { isDefault: true }] }
      : { isDefault: true };

    const categories = await Category.find(query).sort({ name: 1 }).lean();
    return categories;
  }

  /**
   * Create a new category
   */
  static async createCategory(data: Partial<ICategory>): Promise<ICategory> {
    await connectDB();
    const category = await Category.create(data);
    return category.toObject();
  }

  /**
   * Get category names only (for AI prompt)
   */
  static async getCategoryNames(userId?: string): Promise<{
    expense: string[];
    income: string[];
  }> {
    await connectDB();

    const query = userId
      ? { $or: [{ userId }, { isDefault: true }] }
      : { isDefault: true };

    const categories = await Category.find(query).lean();

    const expenseCategories = categories
      .filter((c) => c.type === "expense" || c.type === "both")
      .map((c) => c.name)
      .sort();

    const incomeCategories = categories
      .filter((c) => c.type === "income" || c.type === "both")
      .map((c) => c.name)
      .sort();

    return {
      expense: expenseCategories,
      income: incomeCategories,
    };
  }

  /**
   * Seed default categories
   */
  static async seedDefaultCategories(): Promise<void> {
    await connectDB();

    const defaultCategories: Partial<ICategory>[] = [
      { name: "Food & Dining", type: "expense", icon: "utensils", color: "#ef4444", isDefault: true },
      { name: "Shopping", type: "expense", icon: "shopping-bag", color: "#f59e0b", isDefault: true },
      { name: "Transportation", type: "expense", icon: "car", color: "#3b82f6", isDefault: true },
      { name: "Bills & Utilities", type: "expense", icon: "file-text", color: "#8b5cf6", isDefault: true },
      { name: "Entertainment", type: "expense", icon: "film", color: "#ec4899", isDefault: true },
      { name: "Healthcare", type: "expense", icon: "heart", color: "#10b981", isDefault: true },
      { name: "Travel", type: "expense", icon: "plane", color: "#06b6d4", isDefault: true },
      { name: "Education", type: "expense", icon: "book", color: "#6366f1", isDefault: true },
      { name: "Personal Care", type: "expense", icon: "sparkles", color: "#f97316", isDefault: true },
      { name: "Other", type: "both", icon: "tag", color: "#6b7280", isDefault: true },
      { name: "Salary", type: "income", icon: "banknote", color: "#22c55e", isDefault: true },
      { name: "Freelance", type: "income", icon: "briefcase", color: "#14b8a6", isDefault: true },
      { name: "Investment", type: "income", icon: "trending-up", color: "#8b5cf6", isDefault: true },
    ];

    for (const cat of defaultCategories) {
      await Category.findOneAndUpdate(
        { name: cat.name, isDefault: true },
        cat,
        { upsert: true }
      );
    }

    console.log("✅ Default categories seeded");
  }
}
