"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { ChatMessage } from "@/types";
import {
  UI_CONSTANTS,
  WELCOME_MESSAGES,
  PLACEHOLDER_MESSAGES,
  API_ROUTES,
  TRANSACTION_TYPE_LABELS_VI,
} from "@/lib/constants";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // Use setTimeout to ensure DOM has updated
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
      // Call API to process transaction
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
          // If there's a user-friendly message from server, use it directly
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
          // If JSON parsing fails, use status text
          errorMessage = `${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Add assistant response
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Gradient Background */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 rounded-3xl blur-3xl" />

        <Card className={`relative backdrop-blur-xl bg-card/80 border-2 border-white/10 shadow-2xl h-[${UI_CONSTANTS.CHAT_HEIGHT}px] flex flex-col rounded-3xl overflow-hidden`}>
          {/* Modern Header with Gradient */}
          <div className="relative p-6 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Nhập giao dịch
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Gõ giao dịch bằng ngôn ngữ tự nhiên
              </p>
            </div>
          </div>

          {/* Messages with Modern Styling */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 backdrop-blur-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30"
                        : message.role === "system"
                        ? "bg-gradient-to-br from-slate-800/50 to-slate-700/50 text-slate-200 border border-white/10"
                        : "bg-gradient-to-br from-slate-800/80 to-slate-700/80 text-white border border-white/10 shadow-xl"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>

                    {/* Transaction Badge with Modern Design */}
                    {message.transaction && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={
                            message.transaction.type === "income"
                              ? "default"
                              : "destructive"
                          }
                          className={`flex items-center gap-1 px-3 py-1 rounded-full shadow-lg ${
                            message.transaction.type === "income"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          }`}
                        >
                          {message.transaction.type === "income" ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {TRANSACTION_TYPE_LABELS_VI[message.transaction.type]}
                        </Badge>
                        {message.transaction.aiConfidence && (
                          <span className="text-xs px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                            {Math.round(message.transaction.aiConfidence * 100)}% AI
                          </span>
                        )}
                      </div>
                    )}

                    <div className="text-xs opacity-60 mt-2">
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
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-white/10 rounded-2xl p-4 shadow-xl">
                    <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
                  </div>
                </div>
              )}

              {/* Invisible div for scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Modern Input with Gradient Border */}
          <form onSubmit={handleSubmit} className="p-6 border-t border-white/10 bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-pink-500/5">
            <div className="flex gap-3">
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={PLACEHOLDER_MESSAGES.CHAT_INPUT}
                  disabled={isLoading}
                  className="relative h-14 px-6 text-base bg-slate-800/50 backdrop-blur-sm border-2 border-white/10 rounded-2xl focus:border-violet-500/50 transition-all placeholder:text-slate-500"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
