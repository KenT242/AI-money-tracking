"use client";

import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { CHART_COLORS, UI_CONSTANTS } from "@/lib/constants";

interface CategoryChartProps {
  data: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export function CategoryChart({ data }: CategoryChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(UI_CONSTANTS.CURRENCY_LOCALE, {
      style: "currency",
      currency: UI_CONSTANTS.CURRENCY_CODE,
    }).format(value);
  };

  // Take top 7 categories, group rest as "Khác"
  const topCategories = data.slice(0, 7);
  const otherAmount = data.slice(7).reduce((sum, item) => sum + item.amount, 0);

  const chartData = [...topCategories];
  if (otherAmount > 0) {
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
    chartData.push({
      category: "Khác",
      amount: otherAmount,
      percentage: (otherAmount / totalAmount) * 100,
    });
  }

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/20 via-pink-500/20 to-rose-500/20 rounded-3xl blur-3xl" />

      <Card className="relative backdrop-blur-xl bg-card/80 border-2 border-white/10 shadow-2xl rounded-2xl md:rounded-3xl p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Phân bổ theo danh mục
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Chi tiêu theo từng loại
          </p>
        </div>

        {chartData.length > 0 ? (
          <div className="flex flex-col lg:flex-row items-center gap-6 min-h-[350px]">
            {/* Pie Chart */}
            <div className="h-[280px] w-full lg:w-1/2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="amount"
                    label={(entry: any) => `${entry.percentage.toFixed(1)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS.CATEGORY_PALETTE[index % CHART_COLORS.CATEGORY_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      borderRadius: "12px",
                      padding: "12px",
                      backdropFilter: "blur(12px)",
                      color: "#e2e8f0",
                    }}
                    itemStyle={{
                      color: "#f1f5f9",
                    }}
                    labelStyle={{
                      color: "#c084fc",
                      fontWeight: "600",
                    }}
                    formatter={(value) => value ? formatCurrency(value as number) : ""}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category List */}
            <div className="flex-1 space-y-3 w-full">
              {chartData.map((item, index) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS.CATEGORY_PALETTE[index % CHART_COLORS.CATEGORY_PALETTE.length] }}
                    />
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {formatCurrency(item.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Chưa có dữ liệu chi tiêu</p>
          </div>
        )}
      </Card>
    </div>
  );
}
