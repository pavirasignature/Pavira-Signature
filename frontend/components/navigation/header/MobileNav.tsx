"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X } from "lucide-react";
import { PremiumMandala } from "@/components/PremiumVisuals";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: { label: string; href: string }[];
  isLoggedIn?: boolean;
  userRole?: string;
  handleLogout?: () => void;
}

export default function MobileNav({
  isOpen,
  onClose,
  navLinks,
  isLoggedIn,
  userRole,
  handleLogout,
}: MobileNavProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, rotateX: -20 },
    show: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: "spring", stiffness: 100 },
    },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-[#0B3B2E] flex flex-col"
        >
          {/* Animated Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] opacity-[0.03] pointer-events-none mix-blend-screen animate-[spin_120s_linear_infinite]">
            <PremiumMandala />
          </div>

          <div className="relative z-10 p-6 flex justify-between items-center border-b border-[#D4AF37]/10">
            <Link
              href="/"
              className="group flex items-center gap-3"
              onClick={onClose}
            >
              <div className="w-8 h-8 relative flex items-center justify-center overflow-hidden group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.6)] transition-all duration-300">
                <Image
                  src="/logo.png"
                  alt="Pavira Signature Logo"
                  fill
                  priority
                  unoptimized
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col items-start justify-center">
                <span className="brand-name text-lg md:text-xl font-brand font-normal text-[#D4AF37] group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.8)] transition-all duration-300 tracking-wide leading-tight uppercase">
                  Pavira Signature
                </span>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="p-2 text-[#F5F0E6]/60 hover:text-[#D4AF37] hover:rotate-90 transition-all duration-300"
            >
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
            <motion.nav
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex flex-col items-center gap-8"
            >
              {navLinks.map((link) => (
                <motion.div key={link.href} variants={itemVariants}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="text-3xl md:text-5xl font-serif text-[#F5F0E6] hover:text-[#D4AF37] transition-colors relative group block"
                  >
                    {link.label}
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#D4AF37] group-hover:w-full transition-all duration-500 ease-out" />
                  </Link>
                </motion.div>
              ))}

              <motion.div variants={itemVariants}>
                <Link
                  href={
                    isLoggedIn
                      ? userRole === "admin"
                        ? "/admin/dashboard"
                        : "/dashboard"
                      : "/login"
                  }
                  onClick={onClose}
                  className="text-3xl md:text-5xl font-serif text-[#D4AF37] hover:text-[#F5F0E6] transition-colors relative group block mt-4"
                >
                  {isLoggedIn ? "Dashboard" : "Sign In"}
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#F5F0E6] group-hover:w-full transition-all duration-500 ease-out" />
                </Link>
              </motion.div>

              {isLoggedIn && handleLogout && (
                <motion.div variants={itemVariants}>
                  <button
                    onClick={() => {
                      handleLogout();
                      onClose();
                    }}
                    className="text-xl md:text-3xl font-serif text-[#F5F0E6]/60 hover:text-red-400 transition-colors relative group block mt-2"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </motion.nav>
          </div>

          <div className="relative z-10 p-8 text-center border-t border-[#D4AF37]/10">
            <p className="text-xs text-[#D4AF37] uppercase tracking-[0.3em] mb-2 font-bold">
              Discover Luxury
            </p>
            <p className="text-[#F5F0E6]/40 text-sm">
              Crafted with precision, delivered with grace.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
