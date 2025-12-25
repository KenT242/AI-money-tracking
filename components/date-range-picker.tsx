"use client";

import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from "date-fns";
import { vi } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDateRange = () => {
    if (!dateRange?.from) return "Chọn khoảng thời gian";
    if (!dateRange.to) return format(dateRange.from, "dd MMM yyyy", { locale: vi });
    return `${format(dateRange.from, "dd MMM", { locale: vi })} - ${format(dateRange.to, "dd MMM yyyy", { locale: vi })}`;
  };

  const presetRanges = [
    {
      label: "Ngày hiện tại",
      getRange: () => {
        const now = new Date();
        return {
          from: startOfDay(now),
          to: endOfDay(now),
        };
      },
    },
    {
      label: "Tuần hiện tại",
      getRange: () => {
        const now = new Date();
        return {
          from: startOfWeek(now, { weekStartsOn: 1 }), // Monday
          to: endOfWeek(now, { weekStartsOn: 1 }),
        };
      },
    },
    {
      label: "Tháng hiện tại",
      getRange: () => {
        const now = new Date();
        return {
          from: startOfMonth(now),
          to: endOfMonth(now),
        };
      },
    },
    {
      label: "Hôm qua",
      getRange: () => {
        const yesterday = subDays(new Date(), 1);
        return {
          from: startOfDay(yesterday),
          to: endOfDay(yesterday),
        };
      },
    },
    {
      label: "Tuần trước",
      getRange: () => {
        const lastWeek = subWeeks(new Date(), 1);
        return {
          from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          to: endOfWeek(lastWeek, { weekStartsOn: 1 }),
        };
      },
    },
    {
      label: "Tháng trước",
      getRange: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        };
      },
    },
    {
      label: "3 tháng trước",
      getRange: () => {
        const now = new Date();
        const threeMonthsAgo = subMonths(now, 3);
        return {
          from: startOfMonth(threeMonthsAgo),
          to: endOfMonth(now),
        };
      },
    },
  ];

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="rounded-2xl bg-white/5 hover:bg-white/10 border-white/10 backdrop-blur-sm h-12 px-4"
      >
        <CalendarIcon className="w-4 h-4 mr-2" />
        <span className="text-sm">{formatDateRange()}</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="fixed sm:absolute top-14 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 z-[101] w-auto animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative w-fit">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 rounded-3xl blur-2xl -z-10" />

              <Card className="relative backdrop-blur-xl bg-card/95 border-2 border-white/10 shadow-2xl rounded-3xl p-6 w-auto">
                {/* Preset Buttons */}
                <div className="space-y-2 w-[280px]">
                  <p className="text-xs text-muted-foreground mb-3">
                    Chọn khoảng thời gian
                  </p>
                  <div className="space-y-2">
                    {presetRanges.map((preset) => (
                      <Button
                        key={preset.label}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onDateRangeChange(preset.getRange());
                          setIsOpen(false);
                        }}
                        className="w-full justify-start rounded-xl bg-white/5 hover:bg-white/10 text-sm h-10"
                        type="button"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onDateRangeChange(undefined);
                      setIsOpen(false);
                    }}
                    className="w-full rounded-xl bg-white/5 hover:bg-white/10"
                    type="button"
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
