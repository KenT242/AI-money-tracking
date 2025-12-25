"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Calendar, ChevronLeft, ChevronRight, Filter, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { UI_CONSTANTS, TRANSACTION_TYPE_LABELS_VI, API_ROUTES } from "@/lib/constants";

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  merchant?: string;
  date: string;
  aiConfidence?: number;
}

interface TransactionListProps {
  startDate?: Date;
  endDate?: Date;
}

export function TransactionList({ startDate, endDate }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(UI_CONSTANTS.CURRENCY_LOCALE, {
      style: "currency",
      currency: UI_CONSTANTS.CURRENCY_CODE,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: vi });
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate.toISOString());
        if (endDate) params.append("endDate", endDate.toISOString());

        const response = await fetch(`${API_ROUTES.TRANSACTION_CATEGORIES}?${params.toString()}`);
        const data = await response.json();

        setCategories(["all", ...data.categories]);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, [startDate, endDate]);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", currentPage.toString());
        params.append("limit", UI_CONSTANTS.TRANSACTIONS_PER_PAGE.toString());

        if (selectedCategory && selectedCategory !== "all") {
          params.append("category", selectedCategory);
        }
        if (startDate) params.append("startDate", startDate.toISOString());
        if (endDate) params.append("endDate", endDate.toISOString());

        const response = await fetch(`${API_ROUTES.TRANSACTIONS}?${params.toString()}`);
        const data = await response.json();

        setTransactions(data.transactions);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, selectedCategory, startDate, endDate]);

  // Reset to page 1 when category or date range changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, startDate, endDate]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsFilterOpen(false);
  };

  const getCategoryLabel = () => {
    if (selectedCategory === "all") {
      return "Tất cả danh mục";
    }
    return selectedCategory;
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 rounded-3xl blur-3xl" />

      <Card className="relative backdrop-blur-xl bg-card/80 border-2 border-white/10 shadow-2xl rounded-2xl md:rounded-3xl p-4 md:p-6">
        <div className="mb-4 md:mb-6 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent truncate">
              Giao dịch gần đây
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {total} giao dịch
            </p>
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative flex-shrink-0">
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              variant="outline"
              size="sm"
              className="rounded-xl bg-white/5 hover:bg-white/10 border-white/10 h-8 md:h-9 px-2 md:px-3"
            >
              <Filter className="w-3.5 h-3.5 md:w-4 md:h-4 md:mr-2" />
              <span className="text-xs hidden md:inline">{getCategoryLabel()}</span>
            </Button>

            {isFilterOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsFilterOpen(false)}
                />

                {/* Dropdown */}
                <div className="absolute top-12 right-0 z-50 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Card className="backdrop-blur-xl bg-card/95 border-2 border-white/10 shadow-2xl rounded-2xl p-3 max-h-80 overflow-y-auto">
                    <div className="space-y-1">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryChange(category)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                            selectedCategory === category
                              ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium"
                              : "hover:bg-white/10 text-foreground"
                          }`}
                        >
                          {category === "all" ? "Tất cả danh mục" : category}
                        </button>
                      ))}
                    </div>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active Filter Badge */}
        {selectedCategory !== "all" && (
          <div className="mb-4 flex items-center gap-2">
            <Badge
              variant="outline"
              className="px-3 py-1 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border-violet-500/30 text-sm"
            >
              {selectedCategory}
              <button
                onClick={() => handleCategoryChange("all")}
                className="ml-2 hover:bg-white/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-400" />
            <p className="mt-4 text-muted-foreground">Đang tải...</p>
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
              {transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="group p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between gap-2 md:gap-4">
                    {/* Left: Transaction Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                        <h4 className="font-semibold text-sm md:text-base truncate">
                          {transaction.description}
                        </h4>
                        {transaction.aiConfidence && (
                          <Badge
                            variant="outline"
                            className="px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs bg-white/5 border-white/20 hidden sm:inline-flex"
                          >
                            {Math.round(transaction.aiConfidence * 100)}% AI
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-0.5 md:gap-1">
                          <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          {formatDate(transaction.date)}
                        </span>
                        <Badge
                          variant="outline"
                          className="px-1.5 md:px-2 py-0.5 bg-white/5 border-white/10 text-[10px] md:text-xs"
                        >
                          {transaction.category}
                        </Badge>
                        {transaction.merchant && (
                          <span className="text-[10px] md:text-xs hidden sm:inline">· {transaction.merchant}</span>
                        )}
                      </div>
                    </div>

                    {/* Right: Amount & Type */}
                    <div className="flex flex-col items-end gap-1 md:gap-2 flex-shrink-0">
                      <div
                        className={`text-base md:text-lg font-bold ${
                          transaction.type === "income"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <Badge
                        variant="outline"
                        className={`px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs flex items-center gap-0.5 md:gap-1 ${
                          transaction.type === "income"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        ) : (
                          <TrendingDown className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        )}
                        <span className="hidden sm:inline">{TRANSACTION_TYPE_LABELS_VI[transaction.type]}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-white/10">
                <div className="text-xs md:text-sm text-muted-foreground">
                  Trang {currentPage} / {totalPages}
                </div>
                <div className="flex gap-1.5 md:gap-2">
                  <Button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="rounded-xl bg-white/5 hover:bg-white/10 border-white/10 disabled:opacity-50 disabled:cursor-not-allowed h-8 md:h-auto px-2 md:px-3"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4 md:mr-1" />
                    <span className="hidden md:inline">Trước</span>
                  </Button>
                  <Button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="rounded-xl bg-white/5 hover:bg-white/10 border-white/10 disabled:opacity-50 disabled:cursor-not-allowed h-8 md:h-auto px-2 md:px-3"
                  >
                    <span className="hidden md:inline">Sau</span>
                    <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 md:ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Chưa có giao dịch nào</p>
          </div>
        )}
      </Card>
    </div>
  );
}
