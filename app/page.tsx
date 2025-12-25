"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TransactionChat } from "@/components/transaction-chat";
import { Button } from "@/components/ui/button";
import { LogOut, User, BarChart3, MessageSquare } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Get user info from session
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUserName(data.user.name);
        }
      })
      .catch(console.error);
  }, []);

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

      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 py-2 md:py-6 mb-3 md:mb-8 px-3 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo - Hidden on mobile */}
          <h1 className="hidden md:block text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Money Tracking
          </h1>

          {/* Navigation - Mobile optimized */}
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 hover:from-violet-500/30 hover:to-fuchsia-500/30 backdrop-blur-sm border border-violet-500/30 h-7 w-7 md:h-auto md:w-auto p-0 md:px-3 md:py-2"
            >
              <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Chat</span>
            </Button>
            <Button
              onClick={() => router.push("/analytics")}
              variant="ghost"
              size="sm"
              className="rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 h-7 w-7 md:h-auto md:w-auto p-0 md:px-3 md:py-2"
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

      <div className="w-full max-w-6xl mx-auto space-y-6 md:space-y-12 relative z-10 flex-1 flex flex-col items-center justify-center px-3 md:px-8">
        {/* Modern Header */}
        <div className="text-center space-y-2 md:space-y-4">
          <h1 className="text-4xl md:text-7xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Money Tracking
          </h1>

          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 px-4">
            Quản lý chi tiêu thông minh
          </p>
        </div>

        {/* Chat Component */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <TransactionChat />
        </div>
      </div>
    </main>
  );
}
