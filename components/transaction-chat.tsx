"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, TrendingUp, TrendingDown, Edit2, Check, X } from "lucide-react";
import { ChatMessage, ICategory } from "@/types";
import {
  UI_CONSTANTS,
  WELCOME_MESSAGES,
  PLACEHOLDER_MESSAGES,
  API_ROUTES,
  TRANSACTION_TYPE_LABELS_VI,
} from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TransactionChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "system",
      content: WELCOME_MESSAGES.CHAT_WELCOME,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allCategories, setAllCategories] = useState<ICategory[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editType, setEditType] = useState<"income" | "expense">("expense");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all categories with full info
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(API_ROUTES.TRANSACTION_CATEGORIES);
        if (!response.ok) {
          console.error("API error:", response.status);
          return;
        }
        const data = await response.json();
        console.log("Fetched category names:", data.categories);

        // Since this API only returns names, we need to fetch full categories
        const fullResponse = await fetch("/api/categories/all");
        if (fullResponse.ok) {
          const fullData = await fullResponse.json();
          console.log("Fetched full categories:", fullData.categories);
          setAllCategories(fullData.categories || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, UI_CONSTANTS.AUTO_SCROLL_DELAY);

    return () => clearTimeout(timer);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(API_ROUTES.CHAT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            const errorMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: errorData.message,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
            return;
          }
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        transaction: data.transaction,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error processing transaction:", error);

      const errorDetails =
        error instanceof Error ? error.message : "Unknown error";

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ Xin lỗi, đã có lỗi xảy ra khi xử lý giao dịch.\n\nChi tiết: ${errorDetails}\n\nVui lòng thử lại hoặc kiểm tra kết nối AI API.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (message: ChatMessage) => {
    if (!message.transaction) return;

    setEditingMessageId(message.id);
    setEditAmount(message.transaction.amount.toString());
    setEditType(message.transaction.type);
    setEditCategory(message.transaction.category);
  };

  // Reset category when type changes if current category is not valid for new type
  useEffect(() => {
    if (editingMessageId) {
      const filteredCats = allCategories.filter(
        (cat) => cat.type === editType || cat.type === "both"
      );
      const isValidCategory = filteredCats.some((cat) => cat.name === editCategory);

      if (!isValidCategory && filteredCats.length > 0) {
        // Reset to empty so user must choose
        setEditCategory("");
      }
    }
  }, [editType, allCategories, editCategory, editingMessageId]);

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditAmount("");
    setEditCategory("");
    setEditType("expense");
  };

  const handleSaveEdit = async (message: ChatMessage) => {
    if (!message.transaction?._id) return;

    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Số tiền không hợp lệ");
      return;
    }

    if (!editCategory) {
      alert("Vui lòng chọn danh mục");
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${message.transaction._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          category: editCategory,
          type: editType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update transaction");
      }

      const data = await response.json();

      // Update the message with new transaction data
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id
            ? {
                ...msg,
                transaction: data.transaction,
                content: buildUpdatedMessage(data.transaction),
              }
            : msg
        )
      );

      setEditingMessageId(null);
      setEditAmount("");
      setEditCategory("");
      setEditType("expense");
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Không thể cập nhật giao dịch. Vui lòng thử lại.");
    }
  };

  const buildUpdatedMessage = (transaction: any): string => {
    const amountFormatted = new Intl.NumberFormat(UI_CONSTANTS.CURRENCY_LOCALE, {
      style: "currency",
      currency: UI_CONSTANTS.CURRENCY_CODE,
    }).format(transaction.amount);

    const typeText = transaction.type === "income" ? "thu nhập" : "chi tiêu";

    return `✓ Đã cập nhật giao dịch ${typeText}: ${transaction.description}
💰 Số tiền: ${amountFormatted}
📂 Danh mục: ${transaction.category}
${transaction.merchant ? `🏪 Nơi: ${transaction.merchant}` : ""}`;
  };

  // Filter categories by selected type
  const getFilteredCategories = () => {
    const filtered = allCategories.filter(
      (cat) => cat.type === editType || cat.type === "both"
    );
    console.log("Filtered categories for", editType, ":", filtered);
    return filtered;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-0">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 rounded-2xl sm:rounded-3xl blur-3xl" />

        <Card className={`relative backdrop-blur-xl bg-card/80 border-2 border-white/10 shadow-2xl h-[${UI_CONSTANTS.CHAT_HEIGHT}px] flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden`}>
          <div className="relative p-3 sm:p-6 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 border-b border-white/10">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Nhập giao dịch
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                Gõ giao dịch bằng ngôn ngữ tự nhiên
              </p>
            </div>
          </div>

          <ScrollArea className="flex-1 p-3 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30"
                        : message.role === "system"
                        ? "bg-gradient-to-br from-slate-800/50 to-slate-700/50 text-slate-200 border border-white/10"
                        : "bg-gradient-to-br from-slate-800/80 to-slate-700/80 text-white border border-white/10 shadow-xl"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
                      {message.content}
                    </div>

                    {message.transaction && (
                      <>
                        <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <Badge
                            variant={
                              message.transaction.type === "income"
                                ? "default"
                                : "destructive"
                            }
                            className={`flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg text-[10px] sm:text-xs ${
                              message.transaction.type === "income"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            }`}
                          >
                            {message.transaction.type === "income" ? (
                              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            ) : (
                              <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            )}
                            {TRANSACTION_TYPE_LABELS_VI[message.transaction.type]}
                          </Badge>
                          {message.transaction.aiConfidence && (
                            <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-white/10 backdrop-blur-sm">
                              {Math.round(message.transaction.aiConfidence * 100)}% AI
                            </span>
                          )}
                        </div>

                        {/* Edit Form */}
                        {editingMessageId === message.id ? (
                          <div className="mt-3 space-y-2.5 p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                            {/* Type Toggle - Compact for mobile */}
                            <div>
                              <label className="text-[11px] sm:text-xs text-slate-300 block mb-1.5">
                                Loại
                              </label>
                              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => setEditType("expense")}
                                  className={`h-10 sm:h-9 text-xs sm:text-sm font-medium transition-all ${
                                    editType === "expense"
                                      ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg"
                                      : "bg-white/5 hover:bg-white/10 text-slate-300"
                                  }`}
                                >
                                  <TrendingDown className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-1" />
                                  <span className="hidden sm:inline">Chi tiêu</span>
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => setEditType("income")}
                                  className={`h-10 sm:h-9 text-xs sm:text-sm font-medium transition-all ${
                                    editType === "income"
                                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
                                      : "bg-white/5 hover:bg-white/10 text-slate-300"
                                  }`}
                                >
                                  <TrendingUp className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-1" />
                                  <span className="hidden sm:inline">Thu nhập</span>
                                </Button>
                              </div>
                            </div>

                            {/* Amount Input - Larger touch target for mobile */}
                            <div>
                              <label className="text-[11px] sm:text-xs text-slate-300 block mb-1.5">
                                Số tiền
                              </label>
                              <Input
                                type="number"
                                inputMode="numeric"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="h-10 sm:h-9 text-base sm:text-sm bg-slate-900/50 border-white/20 focus:border-white/40"
                                placeholder="0"
                              />
                            </div>

                            {/* Category Select - Simplified label */}
                            <div>
                              <label className="text-[11px] sm:text-xs text-slate-300 block mb-1.5">
                                Danh mục
                              </label>
                              <Select
                                key={editType}
                                value={editCategory}
                                onValueChange={setEditCategory}
                              >
                                <SelectTrigger className="h-10 sm:h-9 text-sm bg-slate-900/50 border-white/20 focus:border-white/40">
                                  <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[60vh]">
                                  {getFilteredCategories().length === 0 ? (
                                    <div className="p-3 text-center text-sm text-slate-400">
                                      Không có danh mục
                                    </div>
                                  ) : (
                                    getFilteredCategories().map((cat) => (
                                      <SelectItem
                                        key={cat._id || cat.name}
                                        value={cat.name}
                                        className="text-sm py-2.5"
                                      >
                                        {cat.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Action Buttons - Stack on very small screens */}
                            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-0.5">
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(message)}
                                className="h-10 sm:h-9 text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-600 font-medium"
                              >
                                <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-1" />
                                <span className="hidden sm:inline">Lưu</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="h-10 sm:h-9 text-xs sm:text-sm border-white/20 hover:bg-white/10 font-medium"
                              >
                                <X className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-1" />
                                <span className="hidden sm:inline">Hủy</span>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClick(message)}
                            className="mt-2 sm:mt-3 h-9 sm:h-8 text-xs hover:bg-white/10 active:bg-white/20"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
                            Chỉnh sửa
                          </Button>
                        )}
                      </>
                    )}

                    <div className="text-[10px] sm:text-xs opacity-60 mt-1.5 sm:mt-2">
                      {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start animate-in fade-in">
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-violet-400" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-3 sm:p-6 border-t border-white/10 bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-pink-500/5">
            <div className="flex gap-2 sm:gap-3">
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={PLACEHOLDER_MESSAGES.CHAT_INPUT}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim() && !isLoading) {
                        handleSubmit(e as any);
                      }
                    }
                  }}
                  className="relative h-12 sm:h-14 px-4 sm:px-6 text-sm sm:text-base bg-slate-800/50 backdrop-blur-sm border-2 border-white/10 rounded-xl sm:rounded-2xl focus:border-violet-500/50 transition-all placeholder:text-slate-500"
                  autoComplete="off"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-12 sm:h-14 w-12 sm:w-auto sm:px-8 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
