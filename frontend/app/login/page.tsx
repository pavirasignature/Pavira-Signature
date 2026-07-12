"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { authAPI } from "@/lib/api";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, ArrowRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import toast from "react-hot-toast";
import { PremiumMandala } from "@/components/PremiumVisuals";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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

        setToken(token);
        setUser(user);
        
        if (typeof window !== "undefined") {
          sessionStorage.setItem("showAccessGrantedAlert", "true");
        }
        
        toast.success("Login successful!");

        if (user.role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/");
        }
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Login failed";
      setError(errMsg);
      toast.error(errMsg);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await signIn("google", {
        callbackUrl: typeof window !== "undefined" ? `${window.location.origin}/` : "/",
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(errMsg);
      toast.error(errMsg);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex bg-[#07241D] text-white selection:bg-[#D4AF37] selection:text-[#0B3B2E] relative overflow-hidden">

      {/* Left Panel - Storytelling (Hidden on mobile) */}
      <div className="hidden lg:flex w-[60%] relative overflow-hidden items-center justify-center bg-[#0B3B2E]">
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
            <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-6 text-[#F5F0E6] drop-shadow-lg">
              Enter the World of<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F5F0E6]">
                Timeless Artistry
              </span>
            </h1>
            <p className="text-xl text-[#F5F0E6]/80 leading-relaxed font-light">
              Access exclusive collections, track your acquisitions, and discover handcrafted masterpieces designed to elevate your sanctuary.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Auth Card */}
      <div className="w-full lg:w-[40%] flex flex-col relative min-h-screen bg-gradient-to-br from-[#112F24] to-[#07241D]">
        {/* Back Button */}
        <div className="pt-6 px-6 md:pt-8 md:px-12 w-full z-20">
          <Link href="/" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#F5F0E6] transition-colors text-xs md:text-sm font-semibold tracking-wider uppercase bg-[#111E16]/80 px-4 py-2.5 rounded-full border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-lg w-fit backdrop-blur-md">
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
                <h2 className="text-3xl font-serif font-bold mb-3 text-[#F5F0E6]">Welcome Back</h2>
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
                  <label className="block text-xs font-semibold mb-2 text-[#F5F0E6]/70 uppercase tracking-widest">
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
                      className="w-full pl-12 pr-4 py-3.5 bg-[#111E16]/80 border border-[#2A4734] focus:border-[#D4AF37] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#F5F0E6] placeholder-[#F5F0E6]/20"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold mb-2 text-[#F5F0E6]/70 uppercase tracking-widest">
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
                      className="w-full pl-12 pr-12 py-3.5 bg-[#111E16]/80 border border-[#2A4734] focus:border-[#D4AF37] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#F5F0E6] placeholder-[#F5F0E6]/20"
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
                    <span className="text-[#F5F0E6]/70 group-hover:text-[#F5F0E6] transition-colors">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[#D4AF37] hover:text-[#F5F0E6] transition-colors font-semibold"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Google Sign-In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full mt-4 inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-[#111E16] font-semibold uppercase tracking-widest text-sm rounded-xl border border-[#D4AF37]/35 hover:bg-[#F7F3E9] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(0,0,0,0.08)]"
                >
                  <ArrowRight size={18} />
                  Continue with Google
                </button>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full mt-8 px-6 py-4 bg-[#D4AF37] text-[#0B3B2E] font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-[#E6C78B] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                >
                  {loading ? "Authenticating..." : "Sign In"}
                </motion.button>
              </form>

              {/* Sign Up Link */}
              <p className="mt-8 text-center text-[#F5F0E6]/60 text-sm">
                New to <span className="font-brand">Pavira Signature</span>?{" "}
                <Link
                  href="/signup"
                  className="text-[#D4AF37] hover:text-[#F5F0E6] transition-colors font-bold underline underline-offset-4"
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
