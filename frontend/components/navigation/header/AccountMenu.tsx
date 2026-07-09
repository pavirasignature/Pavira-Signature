"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Package, ShieldCheck, ChevronDown } from "lucide-react";

interface AccountMenuProps {
  isLoggedIn: boolean;
  userName: string;
  userRole: string;
  handleLogout: () => void;
}

export default function AccountMenu({ isLoggedIn, userName, userRole, handleLogout }: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="relative p-2 text-[#F5F0E6]/90 hover:text-[#D4AF37] transition group flex items-center justify-center"
      >
        <User size={22} strokeWidth={1.5} />
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#D4AF37] group-hover:w-full transition-all duration-300"></span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group"
      >
        <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 flex items-center justify-center bg-[#112F24]/80 group-hover:border-[#D4AF37] transition-all duration-300 overflow-hidden relative shadow-[0_0_10px_rgba(212,175,55,0)] group-hover:shadow-[0_0_10px_rgba(212,175,55,0.2)]">
          <span className="text-[#D4AF37] font-serif text-sm relative z-10 group-hover:scale-110 transition-transform duration-300">
            {userName.charAt(0).toUpperCase()}
          </span>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0B3B2E] to-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <ChevronDown size={14} className={`text-[#F5F0E6]/60 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#D4AF37]" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="absolute top-full right-0 mt-4 w-56 bg-[#0B3B2E]/95 backdrop-blur-xl border border-[#D4AF37]/20 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-[#D4AF37]/10 bg-[#07241D]/50">
              <p className="text-xs text-[#D4AF37] uppercase tracking-widest font-bold mb-1">
                {userRole === "admin" ? "Administrator" : "Collector"}
              </p>
              <p className="text-sm font-serif text-[#F5F0E6] truncate">{userName}</p>
            </div>
            
            <div className="py-2">
              <Link
                href={userRole === "admin" ? "/admin" : "/dashboard"}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#F5F0E6]/80 hover:text-[#D4AF37] hover:bg-[#112F24]/50 transition-colors"
              >
                {userRole === "admin" ? <ShieldCheck size={16} /> : <User size={16} />}
                <span>{userRole === "admin" ? "Admin Panel" : "My Profile"}</span>
              </Link>
              
              {userRole !== "admin" && (
                <Link
                  href="/dashboard/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#F5F0E6]/80 hover:text-[#D4AF37] hover:bg-[#112F24]/50 transition-colors"
                >
                  <Package size={16} />
                  <span>Order History</span>
                </Link>
              )}
            </div>

            <div className="p-2 border-t border-[#D4AF37]/10">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
