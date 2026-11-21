"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  User, 
  Package, 
  Heart, 
  ShoppingBag, 
  Compass, 
  ArrowRight, 
  LogOut,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { getStoredAuth } from "@/lib/authStorage";
import { syncSessionToUrl } from "@/lib/sessionUrl";
import toast from "react-hot-toast";

interface SessionClientProps {
  sessionId: string;
}

export default function SessionClient({ sessionId }: SessionClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const storeUser = useStore((state) => state.user);
  const storeSessionId = useStore((state) => state.sessionId);
  const setSessionId = useStore((state) => state.setSessionId);
  const logout = useStore((state) => state.logout);

  const storedAuth = typeof window !== "undefined" ? getStoredAuth() : { token: null, user: null };
  const currentUser = storeUser || storedAuth.user;

  useEffect(() => {
    setMounted(true);
    if (sessionId) {
      setSessionId(sessionId);
      syncSessionToUrl(sessionId);
    }
  }, [sessionId, setSessionId]);

  const handleCopy = () => {
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText(sessionId);
      setCopied(true);
      toast.success("Session ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSignOut = () => {
    logout();
    toast.success("Signed out of session");
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-foreground pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0C3A2E] to-[#1B2D20] text-[#F9F6F0] p-8 md:p-10 shadow-2xl border border-[#D4AF37]/30"
        >
          {/* Subtle gold decorative glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Authenticated Session
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif tracking-tight text-white">
                Pavira Signature Member Session
              </h1>
              <p className="text-sm sm:text-base text-white/80 max-w-xl">
                Every login is allocated a unique, cryptographically verified session identifier. Your session is active and linked across your browsing experience.
              </p>
            </div>

            <div className="flex md:flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 shrink-0">
              <ShieldCheck className="w-10 h-10 text-[#D4AF37]" strokeWidth={1.5} />
              <span className="text-xs text-white/70 font-mono mt-1 text-center">256-Bit TLS</span>
            </div>
          </div>

          {/* Session ID Box */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <label className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold block mb-2">
              Allotted Session Identifier (UUID)
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 bg-black/40 border border-white/15 rounded-xl px-4 py-3 flex items-center justify-between overflow-hidden">
                <span className="font-mono text-sm sm:text-base text-emerald-400 font-semibold tracking-wide truncate selection:bg-[#D4AF37] selection:text-black">
                  {sessionId}
                </span>
                <span className="text-[10px] uppercase font-mono text-white/40 ml-2 shrink-0">v4 UUID</span>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c29d2e] text-black font-semibold text-sm transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] shrink-0"
              >
                {copied ? <Check size={16} className="text-black" /> : <Copy size={16} />}
                <span>{copied ? "Copied" : "Copy ID"}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* User Status Section */}
        {mounted && currentUser ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 md:p-8 border border-border shadow-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0C3A2E] text-[#D4AF37] font-serif text-xl flex items-center justify-center font-bold">
                  {(currentUser.name || currentUser.firstName || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-serif text-foreground font-semibold">
                    {currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || "Valued Patron"}
                  </h2>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <Sparkles size={14} />
                Role: <span className="uppercase">{currentUser.role || "Customer"}</span>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Session Navigation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Link
                  href={`/dashboard?session=${sessionId}`}
                  className="group p-4 rounded-xl border border-border hover:border-accent hover:shadow-md transition-all duration-200 bg-background flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <User className="w-6 h-6 text-accent" />
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-foreground group-hover:text-accent transition-colors">
                      Account Dashboard
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Profile, addresses & security</p>
                  </div>
                </Link>

                <Link
                  href={`/dashboard/orders?session=${sessionId}`}
                  className="group p-4 rounded-xl border border-border hover:border-accent hover:shadow-md transition-all duration-200 bg-background flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Package className="w-6 h-6 text-accent" />
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-foreground group-hover:text-accent transition-colors">
                      Order History
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Track orders & shipments</p>
                  </div>
                </Link>

                <Link
                  href={`/wishlist?session=${sessionId}`}
                  className="group p-4 rounded-xl border border-border hover:border-accent hover:shadow-md transition-all duration-200 bg-background flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Heart className="w-6 h-6 text-accent" />
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-foreground group-hover:text-accent transition-colors">
                      Saved Wishlist
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">View favorited luxury items</p>
                  </div>
                </Link>

                <Link
                  href={`/cart?session=${sessionId}`}
                  className="group p-4 rounded-xl border border-border hover:border-accent hover:shadow-md transition-all duration-200 bg-background flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <ShoppingBag className="w-6 h-6 text-accent" />
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-foreground group-hover:text-accent transition-colors">
                      Shopping Bag
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Review items & checkout</p>
                  </div>
                </Link>

                <Link
                  href={`/products?session=${sessionId}`}
                  className="group p-4 rounded-xl border border-border hover:border-accent hover:shadow-md transition-all duration-200 bg-background flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Compass className="w-6 h-6 text-accent" />
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-foreground group-hover:text-accent transition-colors">
                      Collections
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Handcrafted clocks & metal art</p>
                  </div>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="group p-4 rounded-xl border border-red-200 hover:border-red-400 hover:bg-red-50/50 transition-all duration-200 bg-background flex flex-col justify-between text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <LogOut className="w-6 h-6 text-red-500" />
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-red-600">
                      Sign Out
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">End active session securely</p>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-8 border border-border shadow-sm text-center space-y-5"
          >
            <h3 className="text-xl font-serif font-semibold text-foreground">
              Sign In to Resume This Session
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              You are viewing unique session <span className="font-mono font-bold text-accent">{sessionId.slice(0, 8)}...</span>. Sign in or register to access your personalized orders, cart, and account settings.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/login?session=${sessionId}&redirect=/session/${sessionId}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0C3A2E] hover:bg-[#1B2D20] text-white font-semibold text-sm transition-all shadow-md"
              >
                Log In to Session
              </Link>
              <Link
                href={`/signup?session=${sessionId}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-border hover:border-accent text-foreground font-semibold text-sm transition-all"
              >
                Create Account
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
