"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { UI_CONSTANTS, CHART_COLORS, CHART_CONFIG } from "@/lib/constants";

interface TrendChartProps {
  data: Array<{
    month: string;
    income: number;
    expense: number;
    net: number;
  }>;
}

export function TrendChart({ data }: TrendChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 rounded-3xl blur-3xl" />

      <Card className="relative backdrop-blur-xl bg-card/80 border-2 border-white/10 shadow-2xl rounded-2xl md:rounded-3xl p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Xu hướng thu chi
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Phân tích theo khoảng thời gian đã chọn
          </p>
        </div>

        {!data || data.length === 0 ? (
          <div className="w-full flex items-center justify-center" style={{ height: `${UI_CONSTANTS.CHART_HEIGHT}px` }}>
            <p className="text-muted-foreground">Chưa có dữ liệu trong khoảng thời gian này</p>
          </div>
        ) : (
          <div className="w-full" style={{ height: `${UI_CONSTANTS.CHART_HEIGHT}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray={CHART_CONFIG.GRID_STROKE_DASHARRAY} stroke="#333" opacity={CHART_CONFIG.GRID_OPACITY} />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  style={{ fontSize: "12px", fill: "#cbd5e1" }}
                />
                <YAxis
                  stroke="#94a3b8"
                  style={{ fontSize: "12px", fill: "#cbd5e1" }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    borderRadius: "12px",
                    padding: "12px",
                    backdropFilter: "blur(12px)",
                    color: "#e2e8f0",
                  }}
                  labelStyle={{
                    color: "#c084fc",
                    marginBottom: "8px",
                    fontWeight: "600"
                  }}
                  itemStyle={{
                    color: "#f1f5f9",
                  }}
                  formatter={(value) =>
                    value ? new Intl.NumberFormat(UI_CONSTANTS.CURRENCY_LOCALE, {
                      style: "currency",
                      currency: UI_CONSTANTS.CURRENCY_CODE,
                    }).format(value as number) : ""
                  }
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: "#e2e8f0", fontSize: "14px" }}>{value}</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Thu nhập"
                  stroke={CHART_COLORS.INCOME}
                  strokeWidth={CHART_CONFIG.STROKE_WIDTH.INCOME}
                  dot={{ fill: CHART_COLORS.INCOME, r: CHART_CONFIG.DOT_RADIUS.INCOME }}
                  activeDot={{ r: CHART_CONFIG.ACTIVE_DOT_RADIUS }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Chi tiêu"
                  stroke={CHART_COLORS.EXPENSE}
                  strokeWidth={CHART_CONFIG.STROKE_WIDTH.EXPENSE}
                  dot={{ fill: CHART_COLORS.EXPENSE, r: CHART_CONFIG.DOT_RADIUS.EXPENSE }}
                  activeDot={{ r: CHART_CONFIG.ACTIVE_DOT_RADIUS }}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  name="Chênh lệch"
                  stroke={CHART_COLORS.NET}
                  strokeWidth={CHART_CONFIG.STROKE_WIDTH.NET}
                  strokeDasharray="5 5"
                  dot={{ fill: CHART_COLORS.NET, r: CHART_CONFIG.DOT_RADIUS.NET }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
