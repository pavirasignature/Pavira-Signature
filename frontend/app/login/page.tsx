"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { authAPI } from "@/lib/api";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Sparkles } from "lucide-react";
import { useStore } from "@/store/useStore";
import toast from "react-hot-toast";
import { PremiumMandala } from "@/components/PremiumVisuals";

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
    <main className="min-h-screen w-full flex bg-background text-foreground selection:bg-accent selection:text-white relative overflow-hidden">

      {/* Left Panel - Storytelling (Hidden on mobile) */}
      <div className="hidden lg:flex w-[60%] relative overflow-hidden items-center justify-center bg-[#0C3A2E]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,rgba(11,59,46,1)_100%)] z-0" />

        {/* Animated Mandala Background */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute w-[150%] h-[150%] opacity-20 pointer-events-none z-0"
        >
          <PremiumMandala />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 p-20 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-6 text-[#F9F6F0] drop-shadow-lg">
              Enter the World of<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F9F6F0]">
                Timeless Artistry
              </span>
            </h1>
            <p className="text-xl text-[#F9F6F0]/80 leading-relaxed font-light">
              Access exclusive collections, track your acquisitions, and discover handcrafted masterpieces designed to elevate your sanctuary.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Auth Card */}
      <div className="w-full lg:w-[40%] flex flex-col relative min-h-screen bg-gradient-to-br from-[#112F24] to-[#07241D]">
        {/* Back Button */}
        <div className="pt-6 px-6 md:pt-8 md:px-12 w-full z-20">
          <Link href="/" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#F9F6F0] transition-colors text-xs md:text-sm font-semibold tracking-wider uppercase bg-[#111E16]/80 px-4 py-2.5 rounded-full border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-lg w-fit backdrop-blur-md">
            <ArrowLeft size={16} />
            <span className="text-yellow-500">Back to Gallery</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 z-10 relative">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="bg-[#112F24]/70 border border-[#D4AF37]/15 rounded-3xl p-8 sm:p-10 backdrop-blur-2xl shadow-2xl">
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-serif font-bold mb-3 text-[#F9F6F0]">Welcome Back</h2>
                <p className="text-[#D4AF37]/80 text-sm tracking-wide">
                  Sign in to your <span className="font-brand">Pavira Signature</span> account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm font-light leading-relaxed text-center"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold mb-2 text-[#F9F6F0]/70 uppercase tracking-widest">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 group-focus-within:text-[#D4AF37] transition-colors"
                      size={20}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-[#111E16]/80 border border-[#2A4734] focus:border-[#D4AF37] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#F9F6F0] placeholder-[#F9F6F0]/20"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold mb-2 text-[#F9F6F0]/70 uppercase tracking-widest">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 group-focus-within:text-[#D4AF37] transition-colors"
                      size={20}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-12 py-3.5 bg-[#111E16]/80 border border-[#2A4734] focus:border-[#D4AF37] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#F9F6F0] placeholder-[#F9F6F0]/20"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm mt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 rounded border border-[#2A4734] group-hover:border-[#D4AF37] transition-colors bg-[#111E16]">
                      <input type="checkbox" className="opacity-0 absolute inset-0 cursor-pointer peer" />
                      <div className="w-2.5 h-2.5 rounded-sm bg-[#D4AF37] scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                    <span className="text-[#F9F6F0]/70 group-hover:text-[#F9F6F0] transition-colors">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[#D4AF37] hover:text-[#F9F6F0] transition-colors font-semibold"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Or Divider */}
                <div className="relative my-6 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#D4AF37]/20" />
                  </div>
                  <div className="relative px-4 bg-[#112F24] text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]/80 font-medium">
                    Or Continue With
                  </div>
                </div>

                {/* Luxury Google Authentication Card */}
                <motion.button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  className="group relative w-full overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#07241D]/90 via-[#0C3A2E]/90 to-[#07241D]/90 p-0.5 shadow-xl transition-all duration-500 hover:border-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Ambient Golden Shimmer Sweep */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                  {/* Inner Card Container */}
                  <div className="relative flex items-center justify-center gap-3.5 px-5 py-3.5 rounded-[14px] bg-[#0A261E]/95 backdrop-blur-xl">
                    {/* Multi-color Google Vector Logo in Gold Ring Box */}
                    <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#07241D] border border-[#D4AF37]/40 shadow-inner group-hover:border-[#D4AF37] group-hover:scale-105 transition-all duration-300">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                    </div>

                    <span className="text-sm font-semibold text-[#F9F6F0] group-hover:text-white transition-colors tracking-wide">
                      Continue with Google
                    </span>
                  </div>
                </motion.button>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full mt-8 px-6 py-4 bg-[#0C3A2E] text-white font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-[#0C3A2E]/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Authenticating..." : "Sign In"}
                </motion.button>
              </form>

              {/* Sign Up Link */}
              <p className="mt-8 text-center text-[#F9F6F0]/60 text-sm">
                New to <span className="font-brand">Pavira Signature</span>?{" "}
                <Link
                  href="/signup"
                  className="text-[#D4AF37] hover:text-[#F9F6F0] transition-colors font-bold underline underline-offset-4"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
