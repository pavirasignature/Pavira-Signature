"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import { authAPI } from "@/lib/api";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, { password });
      setSuccess(true);
      toast.success("Password reset successful!");
      setTimeout(() => router.push("/"), 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Reset link invalid or expired");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07241D] text-white relative overflow-hidden">
      {/* Full Page Fixed Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,rgba(11,59,46,1)_100%)] z-0 pointer-events-none" />

      <Header />

      <div className="container mx-auto px-4 pt-32 pb-20 flex items-center justify-center min-h-[calc(100vh-130px)] relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-[#112F24]/70 border border-[#D4AF37]/15 rounded-3xl p-8 sm:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            {/* Gold Accent Line */}
            <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-[#D4AF37] blur-md opacity-50" />

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-serif font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#F5F0E6] via-[#D4AF37] to-[#F5F0E6]">
                Reset Credentials
              </h1>
              <p className="text-[#D4AF37]/80 text-sm leading-relaxed">
                Choose a new, secure password for your luxury <span className="font-brand">Pavira Signature</span> account.
              </p>
            </div>

            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold mb-2 text-[#F5F0E6]/70 uppercase tracking-widest">
                    New Password
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 group-focus-within:text-[#D4AF37] transition-colors"
                      size={20}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-3.5 bg-[#111E16]/80 border border-[#2A4734] focus:border-[#D4AF37] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#F5F0E6] placeholder-[#F5F0E6]/20"
                      placeholder="Enter Your Password"
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

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold mb-2 text-[#F5F0E6]/70 uppercase tracking-widest">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 group-focus-within:text-[#D4AF37] transition-colors"
                      size={20}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-[#111E16]/80 border border-[#2A4734] focus:border-[#D4AF37] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#F5F0E6] placeholder-[#F5F0E6]/20"
                      placeholder="Enter Your Password"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className={`w-full px-6 py-3.5 bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#AA7C11] text-black font-bold rounded-xl hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/10 uppercase tracking-wider text-xs ${loading ? 'pointer-events-none' : ''}`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      Update Credentials
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto text-green-400 animate-pulse">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#F5F0E6]">Password Updated!</h3>
                <p className="text-gray-400 text-sm">
                  Your credentials have been successfully updated. We are redirecting you to the home page...
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
