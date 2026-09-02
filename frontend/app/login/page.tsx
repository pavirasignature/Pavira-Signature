"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { authAPI } from "@/lib/api";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { useStore } from "@/store/useStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Detect NextAuth OAuth errors passed via query params (e.g., ?error=OAuthCallback)
  useEffect(() => {
    const authError = searchParams?.get("error");
    if (authError) {
      const errorMessages: Record<string, string> = {
        OAuthSignin: "Could not start Google sign-in. Please try again.",
        OAuthCallback: "Google sign-in was interrupted. Please try again.",
        OAuthCreateAccount: "Could not create your account via Google. Please try again.",
        Callback: "An error occurred during sign-in. Please try again.",
        AccessDenied: "Access was denied. Please contact support.",
        Configuration: "There is a server configuration issue. Please try again later.",
        Default: "An unexpected sign-in error occurred. Please try again.",
      };
      const message = errorMessages[authError] || errorMessages.Default;
      setError(message);
      toast.error(message);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(formData);

      if (response.data.success) {
        const user = response.data.data.user;
        const token = response.data.data.token;

        // Set loginMethod flag BEFORE setToken to prevent AuthSync from
        // overwriting credentials login with a stale NextAuth session
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("loggedOut");
          sessionStorage.setItem("loginMethod", "credentials");
          sessionStorage.setItem("showAccessGrantedAlert", "true");
        }

        setToken(token);
        setUser(user);

        toast.success("Login successful!");

        // Case-insensitive role check for defensive hardening
        if (user.role?.toLowerCase() === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/");
        }
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Login failed";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      // Clear the loggedOut flag so AuthSync can sync the fresh Google session
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("loggedOut");
      }
      // With redirect: true, signIn() performs a full-page redirect to Google
      // and never returns. Errors are handled via the ?error= query param
      // detected in the useEffect above.
      await signIn("google", {
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      // This catch only fires if signIn() itself throws (e.g., network error
      // before the redirect can happen)
      const errMsg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#F9F6F0] text-[#1A1A1A] selection:bg-[#0C3A2E] selection:text-white relative overflow-hidden">

      {/* Back to Home — top left */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#0C3A2E] hover:text-[#D4AF37] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Split Layout */}
      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* Left Panel — Brand Story (hidden on mobile) */}
        <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center bg-[#0C3A2E]">
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          
          <div className="relative z-10 px-16 xl:px-24 max-w-xl">
            {/* Decorative line */}
            <div className="w-12 h-px bg-[#D4AF37] mb-10" />

            <p className="text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-semibold mb-6">
              Welcome to Pavira
            </p>
            <h1 className="text-4xl xl:text-5xl font-brand text-[#F9F6F0] leading-[1.15] mb-8">
              Curated Décor for
              <br />
              Discerning Spaces
            </h1>
            <p className="text-base text-[#F9F6F0]/60 font-light leading-relaxed mb-12">
              Sign in to access your collections, track orders, and discover handcrafted statement pieces designed for modern Indian interiors.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-col gap-4 text-sm text-[#F9F6F0]/50 font-light">
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-[#D4AF37]" />
                <span>Secure checkout with 256-bit encryption</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-[#D4AF37]" />
                <span>Exclusive member pricing &amp; early access</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-[#D4AF37]" />
                <span>Free design consultation with every order</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-24 pt-24 pb-12 lg:pt-12">
          <div className="w-full max-w-md">

            {/* Header */}
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-3">
                Account
              </p>
              <h2 className="text-3xl md:text-4xl font-brand text-[#1A1A1A] mb-3">
                Sign In
              </h2>
              <p className="text-sm text-muted-foreground font-light">
                Enter your credentials to continue to <span className="font-brand">Pavira Signature</span>
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-[#A85751]/10 border border-[#A85751]/30 text-[#A85751] text-sm font-light leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold mb-2 text-[#1A1A1A]/60 uppercase tracking-[0.15em]">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/25 group-focus-within:text-[#0C3A2E] transition-colors"
                    size={18}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#1A1A1A]/12 focus:border-[#0C3A2E] focus:outline-none focus:ring-1 focus:ring-[#0C3A2E]/20 transition-all text-[#1A1A1A] placeholder-[#1A1A1A]/25 text-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold mb-2 text-[#1A1A1A]/60 uppercase tracking-[0.15em]">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/25 group-focus-within:text-[#0C3A2E] transition-colors"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#1A1A1A]/12 focus:border-[#0C3A2E] focus:outline-none focus:ring-1 focus:ring-[#0C3A2E]/20 transition-all text-[#1A1A1A] placeholder-[#1A1A1A]/25 text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/30 hover:text-[#0C3A2E] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-4 h-4 border border-[#1A1A1A]/20 group-hover:border-[#0C3A2E] transition-colors bg-white">
                    <input type="checkbox" className="opacity-0 absolute inset-0 cursor-pointer peer" />
                    <div className="w-2 h-2 bg-[#0C3A2E] scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                  <span className="text-[#1A1A1A]/50 group-hover:text-[#1A1A1A] transition-colors text-xs">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[#0C3A2E] hover:text-[#D4AF37] transition-colors font-semibold text-xs"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 px-6 py-4 bg-[#0C3A2E] text-white font-semibold uppercase tracking-[0.2em] text-xs hover:bg-[#0C3A2E]/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>

              {/* Divider */}
              <div className="relative my-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1A1A1A]/10" />
                </div>
                <div className="relative px-4 bg-[#F9F6F0] text-[10px] uppercase tracking-[0.25em] text-[#1A1A1A]/40 font-medium">
                  Or
                </div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="group w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-[#1A1A1A]/12 hover:border-[#1A1A1A]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="shrink-0" viewBox="0 0 24 24" width="18" height="18">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-sm font-medium text-[#1A1A1A]/70 group-hover:text-[#1A1A1A] transition-colors">
                  Continue with Google
                </span>
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-10 pt-8 border-t border-[#1A1A1A]/8 text-center">
              <p className="text-sm text-muted-foreground font-light">
                New to <span className="font-brand">Pavira Signature</span>?{" "}
                <Link
                  href="/signup"
                  className="text-[#0C3A2E] hover:text-[#D4AF37] transition-colors font-semibold underline underline-offset-4"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

