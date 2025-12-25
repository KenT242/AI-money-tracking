"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, CreditCard } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    monthIncome: number;
    monthExpense: number;
    monthBalance: number;
    transactionCount: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const cards = [
    {
      title: "Số dư",
      value: stats.balance,
      icon: Wallet,
      color: "violet",
      gradient: "from-violet-500 to-purple-500",
      bgGlow: "bg-violet-500/20",
    },
    {
      title: "Thu nhập tháng",
      value: stats.monthIncome,
      icon: TrendingUp,
      color: "emerald",
      gradient: "from-emerald-500 to-green-500",
      bgGlow: "bg-emerald-500/20",
    },
    {
      title: "Chi tiêu tháng",
      value: stats.monthExpense,
      icon: TrendingDown,
      color: "rose",
      gradient: "from-rose-500 to-red-500",
      bgGlow: "bg-rose-500/20",
    },
    {
      title: "Tổng giao dịch",
      value: stats.transactionCount,
      icon: CreditCard,
      color: "fuchsia",
      gradient: "from-fuchsia-500 to-pink-500",
      bgGlow: "bg-fuchsia-500/20",
      isCount: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="relative animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Glow effect */}
          <div
            className={`absolute inset-0 ${card.bgGlow} rounded-2xl md:rounded-3xl blur-xl opacity-50`}
          />

          <Card className="relative backdrop-blur-xl bg-card/80 border-2 border-white/10 shadow-xl rounded-2xl md:rounded-3xl p-4 md:p-6 hover:scale-105 transition-transform">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 md:space-y-2 min-w-0 flex-1">
                <p className="text-xs md:text-sm text-muted-foreground truncate">{card.title}</p>
                <p className="text-lg md:text-2xl font-bold truncate">
                  {card.isCount
                    ? card.value.toLocaleString()
                    : formatCurrency(card.value)}
                </p>
              </div>

              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
              >
                <card.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
