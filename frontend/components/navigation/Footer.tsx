"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground pt-20 pb-10 border-t border-border/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Column 1: Brand */}
          <div className="lg:col-span-2 flex flex-col items-start max-w-sm">
            <Link href="/" className="flex flex-col mb-6">
              <span className="text-2xl font-brand uppercase tracking-widest text-base">
                Pavira Signature
              </span>
              <span className="text-xs uppercase tracking-[0.3em] font-light text-muted-foreground mt-1">
                The Art Of Luxury
              </span>
            </Link>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Premium Wall Art · Wall Clocks · Canvas · Designer Décor
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className="flex flex-col">
            <h4 className="text-sm uppercase tracking-wider font-semibold mb-6 text-base">
              Explore
            </h4>
            <ul className="space-y-4 text-sm font-light text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-base transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-base transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-base transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div className="flex flex-col">
            <h4 className="text-sm uppercase tracking-wider font-semibold mb-6 text-base">
              Policies
            </h4>
            <ul className="space-y-4 text-sm font-light text-muted-foreground">
              <li>
                <Link href="/shipping-policy" className="hover:text-base transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-base transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-base transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-base transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 & 5: Professionals & Connect */}
          <div className="flex flex-col space-y-10">
            <div>
              <h4 className="text-sm uppercase tracking-wider font-semibold mb-6 text-base">
                For Professionals
              </h4>
              <ul className="space-y-4 text-sm font-light text-muted-foreground">
                <li>
                  <Link href="/professionals" className="hover:text-base transition-colors">
                    Architects & Interior Designers
                  </Link>
                </li>
                <li>
                  <Link href="/professionals" className="hover:text-base transition-colors">
                    Bulk & Commercial Projects
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm uppercase tracking-wider font-semibold mb-6 text-base">
                Connect With Us
              </h4>
              <div className="flex flex-col space-y-4 text-sm font-light text-muted-foreground">
                <a href="mailto:connect@pavirasignature.in" className="flex items-center gap-2 hover:text-base transition-colors">
                  <Mail size={16} />
                  <span>connect@pavirasignature.in</span>
                </a>
                <div className="flex gap-4 pt-2">
                  <a href="#" className="hover:text-base transition-colors">
                    <Instagram size={18} />
                  </a>
                  <a href="#" className="hover:text-base transition-colors">
                    <Facebook size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light text-muted-foreground">
          <p>&copy; {currentYear} Pavira Signature. All rights reserved.</p>
          <p className="text-[10px] opacity-50">A brand by Punit Creation</p>
        </div>
      </div>
    </footer>
  );
}
