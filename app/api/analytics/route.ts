import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { TransactionService } from "@/services/transaction.service";
import { startOfMonth, endOfMonth, subMonths, format, differenceInDays, startOfDay, addDays, startOfWeek, addWeeks, addMonths } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const userId = session.userId;

    // Get date range from query params
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Default to current month if no date range provided
    const now = new Date();
    const dateFrom = startDate
      ? new Date(startDate)
      : startOfMonth(now);
    const dateTo = endDate
      ? new Date(endDate)
      : endOfMonth(now);

    // Get all transactions for the user
    const allTransactions = await TransactionService.getTransactionsByUser(
      userId
    );

    // Filter transactions by date range
    const filteredTransactions = allTransactions.filter((t) => {
      const date = new Date(t.date);
      return date >= dateFrom && date <= dateTo;
    });

    // Calculate stats for filtered date range
    const totalIncome = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    // Category breakdown (expenses only) for filtered range
    const categoryMap = new Map<string, number>();
    filteredTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Trend data - adaptive based on date range
    const trendData = [];
    const daysDiff = differenceInDays(dateTo, dateFrom);

    if (daysDiff <= 1) {
      // Single day or less - show hourly data (not implemented, show daily)
      const dayTransactions = filteredTransactions;
      const income = dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

      trendData.push({
        month: format(dateFrom, "dd MMM yyyy"),
        income,
        expense,
        net: income - expense,
      });
    } else if (daysDiff <= 7) {
      // Week or less - show daily breakdown
      for (let i = 0; i <= daysDiff; i++) {
        const currentDay = addDays(dateFrom, i);

        // Only include days up to today
        if (currentDay > now) break;

        const start = startOfDay(currentDay);
        const end = addDays(start, 1);

        const dayTransactions = filteredTransactions.filter((t) => {
          const date = new Date(t.date);
          return date >= start && date < end;
        });

        const income = dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
        const expense = dayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

        trendData.push({
          month: format(currentDay, "dd/MM"),
          income,
          expense,
          net: income - expense,
        });
      }
    } else if (daysDiff <= 90) {
      // Up to 3 months - show weekly breakdown
      let currentDate = startOfWeek(dateFrom, { weekStartsOn: 1 });

      while (currentDate <= dateTo) {
        const weekEnd = addWeeks(currentDate, 1);
        // Don't include weeks that haven't started yet
        const actualWeekEnd = weekEnd > now ? now : weekEnd;

        const weekTransactions = filteredTransactions.filter((t) => {
          const date = new Date(t.date);
          return date >= currentDate && date < actualWeekEnd;
        });

        // Only add if there's data or if the week has started
        if (currentDate <= now) {
          const income = weekTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
          const expense = weekTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

          trendData.push({
            month: format(currentDate, "dd/MM"),
            income,
            expense,
            net: income - expense,
          });
        }

        currentDate = weekEnd;
      }
    } else {
      // More than 3 months - show monthly breakdown
      let currentMonth = startOfMonth(dateFrom);

      while (currentMonth <= dateTo) {
        const monthEnd = endOfMonth(currentMonth);
        // Don't include future months or days beyond today
        const actualMonthEnd = monthEnd > now ? now : monthEnd;

        const monthTransactions = filteredTransactions.filter((t) => {
          const date = new Date(t.date);
          return date >= currentMonth && date <= actualMonthEnd;
        });

        // Only add if the month has started
        if (currentMonth <= now) {
          const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
          const expense = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

          trendData.push({
            month: format(currentMonth, "MMM yyyy"),
            income,
            expense,
            net: income - expense,
          });
        }

        currentMonth = addMonths(currentMonth, 1);
      }
    }

    // Recent transactions from filtered range
    const recentTransactions = filteredTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);

    return NextResponse.json({
      stats: {
        totalIncome,
        totalExpense,
        balance,
        monthIncome: totalIncome, // For selected range
        monthExpense: totalExpense, // For selected range
        monthBalance: balance,
        transactionCount: filteredTransactions.length,
      },
      categoryBreakdown,
      trendData,
      recentTransactions,
      dateRange: {
        from: dateFrom.toISOString(),
        to: dateTo.toISOString(),
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
