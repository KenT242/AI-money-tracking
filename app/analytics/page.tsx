"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User, MessageSquare, BarChart3 } from "lucide-react";
import { StatsCards } from "@/components/stats-cards";
import { TrendChart } from "@/components/trend-chart";
import { CategoryChart } from "@/components/category-chart";
import { TransactionList } from "@/components/transaction-list";
import { DateRangePicker } from "@/components/date-range-picker";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth } from "date-fns";

interface AnalyticsData {
  stats: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    monthIncome: number;
    monthExpense: number;
    monthBalance: number;
    transactionCount: number;
  };
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  trendData: Array<{
    month: string;
    income: number;
    expense: number;
    net: number;
  }>;
  recentTransactions: Array<any>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with current month
  const now = new Date();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(now),
    to: endOfMonth(now),
  });

  const fetchAnalytics = (range?: DateRange) => {
    setIsLoading(true);

    const params = new URLSearchParams();
    if (range?.from) {
      params.append("startDate", range.from.toISOString());
    }
    if (range?.to) {
      params.append("endDate", range.to.toISOString());
    }

    fetch(`/api/analytics?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setAnalyticsData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch analytics:", error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // Get user info
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUserName(data.user.name);
        }
      })
      .catch(console.error);

    // Get analytics data with initial date range
    fetchAnalytics(dateRange);
  }, []);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    fetchAnalytics(range);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/signin");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/30 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 py-2 md:py-6 mb-3 md:mb-8 px-3 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo - Hidden on mobile */}
          <h1 className="hidden md:block text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Money Tracking
          </h1>

          {/* Navigation - Mobile optimized */}
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              size="sm"
              className="rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 h-7 w-7 md:h-auto md:w-auto p-0 md:px-3 md:py-2"
            >
              <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Chat</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 hover:from-violet-500/30 hover:to-fuchsia-500/30 backdrop-blur-sm border border-violet-500/30 h-7 w-7 md:h-auto md:w-auto p-0 md:px-3 md:py-2"
            >
              <BarChart3 className="w-3.5 h-3.5 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Analytics</span>
            </Button>
          </div>

          {/* User Info & Logout - Mobile optimized */}
          <div className="flex items-center gap-1 md:gap-3">
            <div className="rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center gap-2 h-7 w-7 md:w-auto md:h-auto p-0 md:px-4 md:py-2 justify-center">
              <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="text-sm hidden md:block">{userName || "Loading..."}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 h-7 w-7 md:h-auto md:w-auto p-0 md:px-3 md:py-2"
            >
              <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto pb-8 md:pb-12 space-y-4 md:space-y-8 flex-1 px-3 md:px-8">
        {/* Page Title & Date Range Picker */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center md:text-left space-y-1 md:space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-1 md:mb-2">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs md:text-sm text-muted-foreground">
                Phân tích tài chính
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Analytics Dashboard
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Theo dõi và phân tích chi tiêu của bạn
            </p>
          </div>

          {/* Date Range Picker */}
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : analyticsData ? (
          <>
            {/* Stats Cards */}
            <StatsCards stats={analyticsData.stats} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
              <TrendChart data={analyticsData.trendData} />
              <CategoryChart data={analyticsData.categoryBreakdown} />
            </div>

            {/* Transaction List */}
            <TransactionList
              startDate={dateRange?.from}
              endDate={dateRange?.to}
            />
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>Không thể tải dữ liệu analytics</p>
          </div>
        )}
      </div>
    </main>
  );
}
