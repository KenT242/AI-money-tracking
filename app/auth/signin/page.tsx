"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const body = isLogin
        ? { username: formData.username, password: formData.password }
        : formData;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Redirect to home page
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/30 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Secure Authentication
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Money App
          </h1>

          <p className="text-lg text-muted-foreground">
            {isLogin
              ? "Đăng nhập để quản lý chi tiêu của bạn"
              : "Tạo tài khoản mới"}
          </p>
        </div>

        {/* Login/Signup Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 rounded-3xl blur-3xl" />

          <Card className="relative backdrop-blur-xl bg-card/80 border-2 border-white/10 shadow-2xl rounded-3xl p-8">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">
                  {isLogin ? "Chào mừng trở lại" : "Tạo tài khoản"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isLogin
                    ? "Đăng nhập với tài khoản của bạn"
                    : "Điền thông tin để tạo tài khoản mới"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tên hiển thị</label>
                    <Input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="h-12 px-4 bg-slate-800/50 backdrop-blur-sm border-2 border-white/10 rounded-2xl focus:border-violet-500/50"
                      required
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên đăng nhập</label>
                  <Input
                    type="text"
                    placeholder="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="h-12 px-4 bg-slate-800/50 backdrop-blur-sm border-2 border-white/10 rounded-2xl focus:border-violet-500/50"
                    required
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mật khẩu</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="h-12 px-4 bg-slate-800/50 backdrop-blur-sm border-2 border-white/10 rounded-2xl focus:border-violet-500/50"
                    required
                    disabled={isLoading}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                    <p className="text-sm text-rose-300">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-violet-500/30 transition-all text-base font-semibold"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isLogin ? (
                    "Đăng nhập"
                  ) : (
                    "Tạo tài khoản"
                  )}
                </Button>
              </form>

              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  className="w-full text-sm text-center text-muted-foreground hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {isLogin ? (
                    <>
                      Chưa có tài khoản?{" "}
                      <span className="text-violet-400 font-semibold">
                        Đăng ký ngay
                      </span>
                    </>
                  ) : (
                    <>
                      Đã có tài khoản?{" "}
                      <span className="text-violet-400 font-semibold">
                        Đăng nhập
                      </span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2">
                <p className="text-xs text-center text-muted-foreground">
                  Session sẽ tự động hết hạn sau 30 ngày
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 pt-8">
          {[
            { icon: "🔒", text: "Bảo mật" },
            { icon: "☁️", text: "Cloud Sync" },
            { icon: "📊", text: "Analytics" },
          ].map((feature) => (
            <div
              key={feature.text}
              className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <div className="text-xs text-muted-foreground">
                {feature.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
