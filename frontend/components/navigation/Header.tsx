"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Heart, ShoppingBag, Lock } from "lucide-react";
import { useStore } from "@/store/useStore";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

import CartDrawer from "./header/CartDrawer";
import AccountMenu from "./header/AccountMenu";
import SearchOverlay from "./header/SearchOverlay";
import MobileNav from "./header/MobileNav";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAccessGranted, setShowAccessGranted] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("customer");

  const cart = useStore((state: any) => state.cart);
  const wishlist = useStore((state: any) => state.wishlist);
  const logout = useStore((state: any) => state.logout);

  const cartCount = cart.reduce(
    (sum: number, item: any) => sum + (item.quantity || 0),
    0,
  );
  const wishlistCount = wishlist.length;

  // Scroll Animation Logic
  const { scrollY } = useScroll();
  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ["rgba(11,59,46,0)", "rgba(11,59,46,0.75)"],
  );
  const headerBackdropBlur = useTransform(
    scrollY,
    [0, 100],
    ["blur(0px)", "blur(24px)"],
  );
  const headerBorder = useTransform(
    scrollY,
    [0, 100],
    ["rgba(212,175,55,0)", "rgba(212,175,55,0.08)"],
  );
  const headerShadow = useTransform(
    scrollY,
    [0, 100],
    ["0px 0px 0px rgba(0,0,0,0)", "0px 10px 30px rgba(0,0,0,0.3)"],
  );

  useEffect(() => {
    checkAuth();
    if (typeof window !== "undefined") {
      const showAlert = sessionStorage.getItem("showAccessGrantedAlert");
      if (showAlert === "true") {
        setShowAccessGranted(true);
        
        // Remove it after a short delay so React StrictMode's double-mount in dev doesn't swallow it
        const removeTimer = setTimeout(() => {
          sessionStorage.removeItem("showAccessGrantedAlert");
        }, 1000);

        const hideTimer = setTimeout(() => {
          setShowAccessGranted(false);
        }, 4000);

        return () => {
          clearTimeout(removeTimer);
          clearTimeout(hideTimer);
        };
      }
    }
  }, [pathname]);

  const checkAuth = () => {
    const token =
      typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    const storedUser =
      typeof window !== "undefined" ? sessionStorage.getItem("user") : null;

    if (token) {
      setIsLoggedIn(true);
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUserName(parsed.name || parsed.firstName || "User");
          setUserRole(parsed.role || "customer");
        } catch (e) {
          setUserName("User");
          setUserRole("customer");
        }
      }
    } else {
      setIsLoggedIn(false);
      setUserRole("customer");
    }
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUserRole("customer");
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          backgroundColor: headerBg,
          backdropFilter: headerBackdropBlur,
          borderBottomColor: headerBorder,
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          boxShadow: headerShadow,
        }}
        className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
      >
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 relative flex items-center justify-center overflow-hidden group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.6)] transition-all duration-300">
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (pathname?.startsWith(link.href) && link.href !== "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-wide transition-all duration-300 relative group font-light ${
                    isActive
                      ? "text-[#D4AF37] font-medium"
                      : "text-[#F5F0E6]/80 hover:text-[#D4AF37]"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-2 left-1/2 -translate-x-1/2 h-[1px] transition-all duration-300 bg-[#D4AF37] ${
                      isActive
                        ? "w-1/2 shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-6">
            <SearchOverlay />

            <Link
              href="/wishlist"
              className="relative p-2 text-[#F5F0E6]/90 hover:text-[#D4AF37] transition group flex items-center justify-center"
            >
              <Heart size={22} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-[#D4AF37] text-[#0B3B2E] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)] border border-[#0B3B2E]">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#F5F0E6]/90 hover:text-[#D4AF37] transition group flex items-center justify-center"
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-[#D4AF37] text-[#0B3B2E] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)] border border-[#0B3B2E]">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="w-[1px] h-6 bg-[#D4AF37]/20 mx-2" />

            <AccountMenu
              isLoggedIn={isLoggedIn}
              userName={userName}
              userRole={userRole}
              handleLogout={handleLogout}
            />
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <SearchOverlay />

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#F5F0E6]/90 hover:text-[#D4AF37] transition"
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-[#D4AF37] text-[#0B3B2E] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)] border border-[#0B3B2E]">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="p-2 text-[#F5F0E6]/90 hover:text-[#D4AF37] transition"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.header>

      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        handleLogout={handleLogout}
      />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <AnimatePresence>
        {showAccessGranted && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, transition: { duration: 0.3 } }}
            transition={{ type: "spring", damping: 15 }}
            className="fixed right-8 bottom-8 z-[9999] w-80 bg-[#0B3B2E] border-2 border-[#D4AF37] rounded-2xl p-6 shadow-[0_0_50px_rgba(212,175,55,0.3)] backdrop-blur-md"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] flex items-center justify-center animate-pulse">
                <Lock className="text-[#D4AF37]" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-[#D4AF37] tracking-widest uppercase mb-1">Access Granted</h3>
                <p className="text-[#F5F0E6]/80 text-xs leading-relaxed">
                  Welcome to Pavira Signature.<br />Secure session successfully verified.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
