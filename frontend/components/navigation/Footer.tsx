"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0C3A2E] text-[#F9F6F0] pt-20 pb-10 border-t border-white/10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Column 1: Brand */}
          <div className="lg:col-span-2 flex flex-col items-start max-w-sm">
            <Link href="/" className="flex flex-col mb-4">
              <span className="text-2xl font-brand uppercase tracking-[0.15em] text-[#F9F6F0]">
                Pavira Signature
              </span>
              <span className="text-xs uppercase tracking-[0.3em] font-light text-[#D4AF37] mt-1">
                The Art of Luxury
              </span>
            </Link>
            <p className="text-sm font-light text-[#F9F6F0]/80 leading-relaxed mb-6">
              Premium Wall Art · Wall Clocks · Canvas · Décor
            </p>
            <p className="text-xs font-light text-[#F9F6F0]/70 leading-relaxed">
              Designed and precision-manufactured in Ahmedabad for modern Indian spaces.
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className="flex flex-col">
            <h4 className="text-xs uppercase tracking-[0.25em] font-semibold mb-6 text-[#D4AF37]">
              Explore
            </h4>
            <ul className="space-y-3.5 text-sm font-light text-[#F9F6F0]/80">
              <li>
                <Link href="/products" className="hover:text-[#D4AF37] transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/products?category=wall-clocks" className="hover:text-[#D4AF37] transition-colors">
                  Wall Clocks
                </Link>
              </li>
              <li>
                <Link href="/products?category=wall-arts" className="hover:text-[#D4AF37] transition-colors">
                  Wall Art
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#D4AF37] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#D4AF37] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Policies & Care */}
          <div className="flex flex-col">
            <h4 className="text-xs uppercase tracking-[0.25em] font-semibold mb-6 text-[#D4AF37]">
              Customer Care
            </h4>
            <ul className="space-y-3.5 text-sm font-light text-[#F9F6F0]/80">
              <li>
                <Link href="/shipping-policy" className="hover:text-[#D4AF37] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[#D4AF37] transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#D4AF37] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-[#D4AF37] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#D4AF37] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: For Professionals & Connect */}
          <div className="flex flex-col space-y-8">
            <div>
              <h4 className="text-xs uppercase tracking-[0.25em] font-semibold mb-4 text-[#D4AF37]">
                For Professionals
              </h4>
              <ul className="space-y-3 text-sm font-light text-[#F9F6F0]/80">
                <li>
                  <Link href="/professionals" className="hover:text-[#D4AF37] transition-colors">
                    Architects & Interior Designers
                  </Link>
                </li>
                <li>
                  <Link href="/professionals" className="hover:text-[#D4AF37] transition-colors">
                    Bulk & Commercial Projects
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.25em] font-semibold mb-3 text-[#D4AF37]">
                Connect with Us
              </h4>
              <div className="flex flex-col space-y-2.5 text-xs font-light text-[#F9F6F0]/80">
                <a
                  href="mailto:connect@pavirasignature.in"
                  className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors"
                >
                  <Mail size={14} className="text-[#D4AF37]" />
                  <span>connect@pavirasignature.in</span>
                </a>
                <a
                  href="tel:+918487816296"
                  className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors"
                >
                  <Phone size={14} className="text-[#D4AF37]" />
                  <span>+91 84878 16296</span>
                </a>
                <div className="flex gap-4 pt-2">
                  <a
                    href="https://www.instagram.com/pavirasignature"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#D4AF37] transition-colors p-1"
                    title="Instagram"
                  >
                    <Instagram size={17} />
                  </a>
                  <a
                    href="https://www.facebook.com/pavirasignature"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#D4AF37] transition-colors p-1"
                    title="Facebook"
                  >
                    <Facebook size={17} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Discreet Punit Creation Legal Line */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light text-[#F9F6F0]/60">
          <p>© {currentYear} PAVIRA SIGNATURE. All rights reserved.</p>
          <p className="text-[11px] opacity-70">
            © {currentYear} PAVIRA SIGNATURE | A brand by Punit Creation
          </p>
        </div>
      </div>
    </footer>
  );
}
