"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send } from "lucide-react";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import { authAPI } from "@/lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
      toast.success("Password recovery link sent to your email!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1B2D20] text-white relative overflow-hidden">
      {/* Full Page Fixed Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />

      <Header />

      <div className="container mx-auto px-4 pt-32 pb-20 flex items-center justify-center min-h-[calc(100vh-130px)] relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-[#1A2E20]/90 border border-[#D4AF37]/15 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Subtle Gold Ambient Light */}
            <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-[#D4AF37] blur-md opacity-50" />

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#F5F0E6] via-[#D4AF37] to-[#F5F0E6]">
                Recover Password
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                Enter your email address below and we&apos;ll send you a premium link to securely reset your credentials.
              </p>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      size={20}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-[#111E16] border border-[#2A4734] focus:border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 transition text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#AA7C11] text-black font-bold rounded-lg hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/10"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                      Sending Link...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Reset Instructions
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
                <div className="w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto text-[#D4AF37]">
                  <Mail size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#F5F0E6]">Check Your Inbox</h3>
                <p className="text-gray-400 text-sm">
                  We&apos;ve sent password reset instructions to <strong className="text-[#D4AF37]">{email}</strong>.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-gray-500 hover:text-white transition underline block mx-auto mt-4"
                >
                  Didn&apos;t receive it? Request another link
                </button>
              </motion.div>
            )}

            {/* Back to Login */}
            <div className="mt-8 pt-6 border-t border-[#2A4734]/50 flex items-center justify-center">
              <Link
                href="/login"
                className="text-gray-400 hover:text-[#D4AF37] transition font-semibold text-sm flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
