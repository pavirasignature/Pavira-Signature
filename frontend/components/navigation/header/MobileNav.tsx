"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X } from "lucide-react";

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
          className="fixed inset-0 z-[200] bg-background flex flex-col"
        >

          <div className="relative z-10 p-6 flex justify-between items-center border-b border-border">
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
                <span className="brand-name text-lg md:text-xl font-brand font-normal text-foreground transition-all duration-300 tracking-wide leading-tight uppercase">
                  Pavira Signature
                </span>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-accent hover:rotate-90 transition-all duration-300"
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
                    className="text-3xl md:text-5xl font-brand text-foreground hover:text-accent transition-colors relative group block uppercase"
                  >
                    {link.label}
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-500 ease-out" />
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
                  className="text-3xl md:text-5xl font-brand text-accent hover:text-foreground transition-colors relative group block mt-4 uppercase"
                >
                  {isLoggedIn ? "Dashboard" : "Sign In"}
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-foreground group-hover:w-full transition-all duration-500 ease-out" />
                </Link>
              </motion.div>

              {isLoggedIn && handleLogout && (
                <motion.div variants={itemVariants}>
                  <button
                    onClick={() => {
                      handleLogout();
                      onClose();
                    }}
                    className="text-xl md:text-3xl font-brand text-red-500/60 hover:text-red-500 transition-colors relative group block mt-2 uppercase"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </motion.nav>
          </div>

          <div className="relative z-10 p-8 text-center border-t border-border">
            <p className="text-xs text-accent uppercase tracking-[0.3em] mb-2 font-bold">
              Discover Luxury
            </p>
            <p className="text-muted-foreground text-sm font-light">
              Crafted with precision, delivered with grace.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
