"use client";

import React from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";

export default function ShippingPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#F8F7F3] pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-serif text-[#0B3B2E] mb-6">Shipping & Returns</h1>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#D4AF37]/20 space-y-6 text-gray-600 font-light leading-relaxed">
              <h2 className="text-2xl font-serif text-[#0B3B2E]">Shipping Information</h2>
              <p>We partner with premium couriers to ensure that your artwork arrives safely and securely. All items are carefully packaged in custom protective layers to prevent any damage during transit.</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Domestic Shipping:</strong> Delivery typically takes 3-5 business days.</li>
                <li><strong>International Shipping:</strong> Delivery typically takes 7-14 business days, depending on customs processing in your country.</li>
              </ul>

              <h2 className="text-2xl font-serif text-[#0B3B2E] mt-8">Returns & Exchanges</h2>
              <p>Your satisfaction is paramount. If you are not completely satisfied with your purchase, you may return the item within 14 days of delivery.</p>
              <p>Please note that custom or bespoke commissioned pieces are final sale and non-refundable.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
  );
}
