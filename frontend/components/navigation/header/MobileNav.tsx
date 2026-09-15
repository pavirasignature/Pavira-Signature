"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  X,
  Home,
  Grid2X2,
  Info,
  Phone,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  LogIn,
  User,
  ChevronRight,
  Package,
} from "lucide-react";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: { label: string; href: string }[];
  isLoggedIn?: boolean;
  userRole?: string;
  userName?: string;
  userImage?: string;
  handleLogout?: () => void;
}

const LINK_ICONS: Record<string, React.FC<any>> = {
  HOME: Home,
  COLLECTIONS: Grid2X2,
  ABOUT: Info,
  CONTACT: Phone,
  "ADMIN PANEL": ShieldCheck,
};

export default function MobileNav({
  isOpen,
  onClose,
  navLinks,
  isLoggedIn,
  userRole,
  userName,
  userImage,
  handleLogout,
}: MobileNavProps) {
    const [imgError, setImgError] = React.useState(false);

    useEffect(() => {
      document.body.style.overflow = isOpen ? "hidden" : "unset";
      return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    const isAdmin = userRole === "admin";

    const drawerVariants: Variants = {
      hidden: { x: "100%" },
      show: { x: 0, transition: { type: "spring", stiffness: 300, damping: 35 } },
      exit: { x: "100%", transition: { duration: 0.25, ease: "easeIn" } },
    };

    const itemVariants: Variants = {
      hidden: { opacity: 0, x: 20 },
      show: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.06 + 0.15, duration: 0.3, ease: "easeOut" },
      }),
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[199] bg-black/40 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              variants={drawerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="fixed top-0 right-0 bottom-0 z-[200] w-[85vw] max-w-sm bg-[#F9F6F0] flex flex-col shadow-2xl"
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A1A1A]/10">
                <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 relative">
                    <Image src="/logo.png" alt="Pavira Signature" fill unoptimized className="object-contain" />
                  </div>
                  <span className="font-brand text-base uppercase tracking-wider text-[#1A1A1A]">
                    Pavira Signature
                  </span>
                </Link>
                <button
                  onClick={onClose}
                  className="w-9 h-9 flex items-center justify-center text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 rounded-full transition-all"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* ── User identity strip ── */}
              {isLoggedIn && (() => {
                // Truncate long names — show first 18 chars max
                const displayName = (userName || "My Account").length > 18
                  ? (userName || "My Account").substring(0, 18).trim() + "…"
                  : (userName || "My Account");
                const initial = (userName || "U").charAt(0).toUpperCase();
                const stripContent = (
                  <motion.div
                    custom={0}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    className="mx-4 mt-4 mb-1"
                  >
                    <div className={`flex items-center gap-3 px-4 py-3 border ${
                      isAdmin
                        ? "bg-[#0C3A2E] border-[#0C3A2E]"
                        : "bg-white border-[#1A1A1A]/10"
                    }`}>
                      {/* Avatar */}
                      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-base overflow-hidden ${
                        isAdmin
                          ? "bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37]"
                          : "bg-[#0C3A2E]/10 border border-[#0C3A2E]/20 text-[#0C3A2E]"
                      }`}>
                        {userImage && !imgError ? (
                          <Image
                            src={userImage}
                            alt={displayName}
                            fill
                            className="object-cover"
                            sizes="40px"
                            onError={() => setImgError(true)}
                          />
                        ) : (
                          initial
                        )}
                      </div>
                    {/* Name + Role */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-tight ${
                        isAdmin ? "text-[#F9F6F0]" : "text-[#1A1A1A]"
                      }`}>
                        {displayName}
                      </p>
                      <p className={`text-[10px] uppercase tracking-widest font-bold mt-0.5 ${
                        isAdmin ? "text-[#D4AF37]" : "text-[#0C3A2E]/60"
                      }`}>
                        {isAdmin ? "Administrator" : "My Account"}
                      </p>
                    </div>
                    {/* Arrow */}
                    <ChevronRight size={15} className={isAdmin ? "text-[#F9F6F0]/40" : "text-[#1A1A1A]/30"} />
                  </div>
                </motion.div>
              );

              // For admin — wrap in a Link to /admin; for users — plain display
              return isAdmin ? (
                <Link href="/admin" onClick={onClose}>
                  {stripContent}
                </Link>
              ) : stripContent;
            })()}

            {/* ── Nav links ── */}
            <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
              {navLinks.map((link, i) => {
                const Icon = LINK_ICONS[link.label.toUpperCase()] || Home;
                return (
                  <motion.div key={link.href} custom={i + 1} variants={itemVariants} initial="hidden" animate="show">
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-sm text-[#1A1A1A]/80 hover:text-[#0C3A2E] hover:bg-[#0C3A2E]/5 transition-all group"
                    >
                      <span className="w-8 h-8 flex items-center justify-center bg-[#1A1A1A]/5 group-hover:bg-[#0C3A2E]/10 rounded-sm transition-colors">
                        <Icon size={16} strokeWidth={1.5} />
                      </span>
                      <span className="font-semibold text-sm uppercase tracking-widest">{link.label}</span>
                      <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.div>
                );
              })}

              {/* ── Divider ── */}
              <div className="border-t border-[#1A1A1A]/10 my-3" />

              {/* ── Account links ── */}
              {isLoggedIn ? (
                <>
                  {/* Admin Panel — only for admin */}
                  {isAdmin && (
                    <motion.div custom={navLinks.length + 1} variants={itemVariants} initial="hidden" animate="show">
                      <Link
                        href="/admin"
                        onClick={onClose}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-sm text-[#0C3A2E] hover:bg-[#0C3A2E]/5 transition-all group"
                      >
                        <span className="w-8 h-8 flex items-center justify-center bg-[#0C3A2E]/10 rounded-sm">
                          <ShieldCheck size={16} strokeWidth={1.5} />
                        </span>
                        <span className="font-semibold text-sm uppercase tracking-widest">Admin Panel</span>
                        <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </motion.div>
                  )}

                  {/* My Profile */}
                  <motion.div custom={navLinks.length + 2} variants={itemVariants} initial="hidden" animate="show">
                    <Link
                      href="/dashboard"
                      onClick={onClose}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-sm text-[#1A1A1A]/80 hover:text-[#0C3A2E] hover:bg-[#0C3A2E]/5 transition-all group"
                    >
                      <span className="w-8 h-8 flex items-center justify-center bg-[#1A1A1A]/5 group-hover:bg-[#0C3A2E]/10 rounded-sm transition-colors">
                        <User size={16} strokeWidth={1.5} />
                      </span>
                      <span className="font-semibold text-sm uppercase tracking-widest">My Profile</span>
                      <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.div>

                  {/* My Orders — only for non-admin */}
                  {!isAdmin && (
                    <motion.div custom={navLinks.length + 3} variants={itemVariants} initial="hidden" animate="show">
                      <Link
                        href="/dashboard/orders"
                        onClick={onClose}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-sm text-[#1A1A1A]/80 hover:text-[#0C3A2E] hover:bg-[#0C3A2E]/5 transition-all group"
                      >
                        <span className="w-8 h-8 flex items-center justify-center bg-[#1A1A1A]/5 group-hover:bg-[#0C3A2E]/10 rounded-sm transition-colors">
                          <Package size={16} strokeWidth={1.5} />
                        </span>
                        <span className="font-semibold text-sm uppercase tracking-widest">My Orders</span>
                        <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div custom={navLinks.length + 1} variants={itemVariants} initial="hidden" animate="show">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-sm text-[#0C3A2E] hover:bg-[#0C3A2E]/5 transition-all group"
                  >
                    <span className="w-8 h-8 flex items-center justify-center bg-[#0C3A2E]/10 rounded-sm">
                      <LogIn size={16} strokeWidth={1.5} />
                    </span>
                    <span className="font-semibold text-sm uppercase tracking-widest">Sign In</span>
                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </motion.div>
              )}
            </nav>

            {/* ── Footer ── */}
            <div className="border-t border-[#1A1A1A]/10 px-4 py-4 space-y-3">
              {/* Logout */}
              {isLoggedIn && handleLogout && (
                <button
                  onClick={() => { handleLogout(); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[#A85751] hover:bg-[#A85751]/5 transition-colors rounded-sm"
                >
                  <LogOut size={16} strokeWidth={1.5} />
                  <span className="text-sm font-semibold uppercase tracking-widest">Sign Out</span>
                </button>
              )}
              <div className="text-center pt-1">
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.3em] font-bold mb-1">
                  Discover Luxury
                </p>
                <p className="text-[#1A1A1A]/40 text-[11px] font-light">
                  Crafted with precision, delivered with grace.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
