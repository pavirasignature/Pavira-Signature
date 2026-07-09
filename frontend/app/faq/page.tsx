"use client";

import React from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";

export default function FAQPage() {
  const faqs = [
    {
      question: <>What makes <span className="font-brand">Pavira Signature</span> art pieces unique?</>,
      answer: "Every piece is meticulously handcrafted by master artisans using premium materials, blending sacred geometry with modern luxury."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship globally. Shipping costs and delivery times vary by destination."
    },
    {
      question: "Can I commission a custom piece?",
      answer: "Absolutely. We offer bespoke services to tailor our art to your specific dimensions and color palettes. Please visit our Contact page to request a consultation."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 14 days of delivery for standard items in their original condition. Custom commissioned pieces are non-refundable."
    }
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#F8F7F3] pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-serif text-[#0B3B2E] mb-6">Frequently Asked Questions</h1>
            <p className="text-gray-600 font-light text-lg">
              Find answers to common questions about our products, shipping, and services.
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-[#D4AF37]/20"
              >
                <h3 className="text-xl font-serif text-[#0B3B2E] mb-3">{faq.question}</h3>
                <p className="text-gray-600 font-light leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
