"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { authAPI } from "@/lib/api";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { PremiumMandala } from "@/components/PremiumVisuals";

type VerifyStatus = "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [status, setStatus] = useState<VerifyStatus>("verifying");
  const [message, setMessage] = useState("");
  const hasCalled = useRef(false);

  useEffect(() => {
    const verify = async () => {
      if (hasCalled.current) return;
      hasCalled.current = true;
      if (!token) { setStatus("error"); setMessage("Invalid or missing verification token."); return; }
      try {
        const response = await authAPI.verifyEmail(token);
        if (response.data.success) { setStatus("success"); setMessage(response.data.message || "Email verified successfully! You can now login."); }
        else { setStatus("error"); setMessage(response.data.message || "Verification failed."); }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Invalid or expired verification token. You may already be verified.");
      }
    };
    verify();
  }, [token]);

  return (
    <main className="min-h-screen w-full flex bg-[#07241D] text-white">
      <div className="hidden lg:flex w-[60%] relative overflow-hidden items-center justify-center bg-[#0B3B2E]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,rgba(11,59,46,1)_100%)] z-0" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} className="absolute w-[150%] h-[150%] opacity-20 pointer-events-none z-0">
          <PremiumMandala />
        </motion.div>
        <div className="relative z-10 p-20 max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-6 text-[#F5F0E6] drop-shadow-lg">
              Unlock Your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F5F0E6]">Exclusive Access</span>
            </h1>
            <p className="text-xl text-[#F5F0E6]/80 leading-relaxed font-light">One last step to join our community of connoisseurs.</p>
          </motion.div>
        </div>
      </div>
      <div className="w-full lg:w-[40%] flex flex-col relative min-h-screen bg-gradient-to-br from-[#112F24] to-[#07241D]">
        <div className="pt-6 px-6 md:pt-8 md:px-12 w-full z-20">
          <Link href="/" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#F5F0E6] transition-colors text-xs md:text-sm font-semibold tracking-wider uppercase bg-[#111E16]/80 px-4 py-2.5 rounded-full border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-lg w-fit backdrop-blur-md">
            <ArrowLeft size={16} /><span className="text-yellow-500">Back to Gallery</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 z-10 relative">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
            <div className="bg-[#112F24]/70 border border-[#D4AF37]/15 rounded-3xl p-8 sm:p-10 backdrop-blur-2xl shadow-2xl text-center">
              {status === "verifying" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center"><Loader2 className="text-[#D4AF37] animate-spin" size={36} /></div>
                  <div><h2 className="text-2xl font-serif font-bold text-[#F5F0E6] mb-2">Verifying...</h2><p className="text-[#F5F0E6]/60 text-sm">Please wait while we verify your email address.</p></div>
                </motion.div>
              )}
              {status === "success" && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }} className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center"><CheckCircle className="text-emerald-400" size={40} /></motion.div>
                  <div><h2 className="text-2xl font-serif font-bold text-[#F5F0E6] mb-3">Email Verified!</h2><p className="text-[#F5F0E6]/70 text-sm leading-relaxed mb-2">{message}</p><p className="text-[#D4AF37]/70 text-xs">Welcome to Pavira Signature.</p></div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/login")} className="w-full px-6 py-4 bg-[#D4AF37] text-[#0B3B2E] font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-[#E6C78B] transition-all duration-300">Sign In to Your Account</motion.button>
                </motion.div>
              )}
              {status === "error" && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }} className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center"><XCircle className="text-red-400" size={40} /></motion.div>
                  <div><h2 className="text-2xl font-serif font-bold text-[#F5F0E6] mb-3">Verification Failed</h2><p className="text-[#F5F0E6]/70 text-sm leading-relaxed">{message}</p></div>
                  <div className="flex flex-col gap-3 w-full">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/login")} className="w-full px-6 py-4 bg-[#D4AF37] text-[#0B3B2E] font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-[#E6C78B] transition-all duration-300">Go to Login</motion.button>
                    <Link href="/signup" className="w-full px-6 py-3.5 border border-[#D4AF37]/30 text-[#D4AF37] font-semibold text-sm rounded-xl hover:bg-[#D4AF37]/10 transition-all text-center">Create a New Account</Link>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}