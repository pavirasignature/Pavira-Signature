"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Mail, Instagram, Facebook, ArrowRight } from "lucide-react";
import { PremiumMandala } from "@/components/PremiumVisuals";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  return (
    <footer className="relative bg-[#07271F] overflow-hidden pt-24 pb-12 border-t border-[#D4AF37]/20">
      {/* Background Effects */}
      <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] opacity-[0.03] pointer-events-none mix-blend-screen -translate-y-1/2">
        <PremiumMandala />
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#D4AF37] opacity-[0.03] blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col lg:flex-row justify-between gap-16 mb-20"
        >
          {/* SECTION 1: Brand Story */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-sm"
          >
            <Link
              href="/"
              className="group flex flex-col lg:flex-row items-center gap-3 mb-6"
            >
              <div className="w-12 h-12 relative flex items-center justify-center overflow-hidden group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.6)] transition-all duration-300">
                <Image
                  src="/logo.png"
                  alt="Pavira Signature Logo"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col items-center lg:items-start mt-1">
                <span className="brand-name text-xl font-brand font-normal group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.8)] transition-all duration-300 tracking-wide leading-tight uppercase">
                  Pavira Signature
                </span>
                <span className="brand-name text-[10px] uppercase tracking-widest mt-1 font-light opacity-90 font-['Arial']">
                  The Art Of Luxury
                </span>
              </div>
            </Link>
            <div className="flex flex-col gap-4 text-sm text-[#F5F0E6]/60 font-light items-center lg:items-start">
              <p>
                We curate the extraordinary. Every piece in our gallery is
                meticulously handcrafted by master artisans, blending sacred
                geometry with modern luxury.
              </p>
              <div className="flex gap-3 mt-2 text-[#D4AF37] font-serif text-sm">
                <span>Handcrafted.</span>
                <span>Timeless.</span>
                <span>Meaningful.</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Navigation & Services */}
          <div className="grid grid-cols-2 gap-8 sm:flex sm:flex-row sm:justify-start w-full sm:w-auto sm:gap-24 lg:gap-32 mt-8 sm:mt-0">
            {/* SECTION 2: Navigation */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-start"
            >
              <h4 className="font-serif text-xl text-[#F5F0E6] mb-6 tracking-wide">
                Explore
              </h4>
              <ul className="flex flex-col items-start space-y-4 text-sm text-[#F5F0E6]/60 font-light min-w-fit sm:min-w-[140px]">
                {["Collections", "About", "Contact"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        href={`/${item.toLowerCase() === "collections" ? "products" : item.toLowerCase().replace(/\s+/g, "-")}`}
                        className="hover:text-[#D4AF37] transition-colors relative group w-fit flex items-center"
                      >
                        <span className="w-0 h-[1px] bg-[#D4AF37] mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300" />
                        {item}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </motion.div>

            {/* SECTION 3: Customer Services & Social */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-start"
            >
              <h4 className="font-serif text-xl text-[#F5F0E6] mb-6 tracking-wide">
                Services
              </h4>
              <ul className="flex flex-col items-start space-y-4 text-sm text-[#F5F0E6]/60 font-light mb-10 min-w-fit sm:min-w-[140px]">
                {["My Account", "Order History", "Returns", "Support"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        href={
                          item === "My Account"
                            ? "/dashboard"
                            : item === "Order History"
                              ? "/dashboard/orders"
                              : "/contact"
                        }
                        className="hover:text-[#D4AF37] transition-colors relative group w-fit flex items-center"
                      >
                        <span className="w-0 h-[1px] bg-[#D4AF37] mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300" />
                        {item}
                      </Link>
                    </li>
                  ),
                )}
              </ul>

              {/* SECTION 4: Social Presence */}
              <div className="flex flex-wrap justify-start gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#07271F] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-300"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#07271F] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-300"
                >
                  <Facebook size={16} />
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>


        {/* Divider & Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="pt-8 border-t border-[#D4AF37]/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[#F5F0E6]/40 text-xs font-light"
        >
          <p>
            &copy; {currentYear} PAVIRA SIGNATURE | A brand by Punit Creation.
          </p>
          <div className="flex gap-6">
            <Link href="/shipping-policy" className="hover:text-[#D4AF37] transition-colors">
              Shipping Policy
            </Link>
            <Link href="/privacy-policy" className="hover:text-[#D4AF37] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-[#D4AF37] transition-colors">
              Terms of Service
            </Link>
            <Link href="/refund-policy" className="hover:text-[#D4AF37] transition-colors">
              Refund Policy
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
