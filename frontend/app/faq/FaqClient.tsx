"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function FaqClient() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What makes Pavira Signature art pieces unique?",
      answer:
        "Every piece is meticulously handcrafted by master artisans using premium sustainable materials, blending sacred geometry with modern luxury aesthetics.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes, we ship globally with gallery-grade secure crating and packaging. Shipping costs and delivery times vary by destination.",
    },
    {
      question: "Can I commission a custom piece or bespoke dimensions?",
      answer:
        "Absolutely. We offer tailored bespoke commission services to adapt dimensions, wood stains, and metallic finishes to your space. Please visit our Contact page to consult with an art advisor.",
    },
    {
      question: "What is your return and exchange policy?",
      answer:
        "We accept returns within 14 days of delivery for standard items in their original condition. Custom commissioned pieces are final sale and non-refundable.",
    },
    {
      question: "Where are Pavira Signature products crafted?",
      answer:
        "All our masterpieces are designed and handcrafted at our atelier in Ahmedabad, Gujarat, India by skilled artisans.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B3B2E] via-[#07271F] to-[#0B3B2E] pt-32 pb-20">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20"
          >
            <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase">
              Questions & Answers
            </span>
            <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#F5F0E6] mb-6 tracking-tight leading-tight">
            Frequently Asked <span className="text-[#D4AF37]">Questions</span>
          </h1>
          <p className="text-[#F5F0E6]/70 font-light text-lg leading-relaxed max-w-2xl mx-auto">
            Find answers to common questions about our products, craftsmanship, bespoke orders, and shipping.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <motion.button
                onClick={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
                className="w-full text-left p-8 rounded-2xl bg-[#112F24]/40 backdrop-blur-xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all duration-300 hover:bg-[#112F24]/60 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-serif font-semibold text-[#F5F0E6] group-hover:text-[#D4AF37] transition-colors duration-300 flex-1 text-left">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{
                      rotate: expandedIndex === index ? 180 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 mt-1"
                  >
                    <ChevronDown
                      size={24}
                      className="text-[#D4AF37] group-hover:text-[#D4AF37]"
                      strokeWidth={1.5}
                    />
                  </motion.div>
                </div>
              </motion.button>

              {/* Expandable Answer */}
              <motion.div
                initial={false}
                animate={{
                  height: expandedIndex === index ? "auto" : 0,
                  opacity: expandedIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-0 px-8 pb-6 bg-[#07271F]/50 backdrop-blur-xl border-l-2 border-[#D4AF37]/30 ml-4">
                  <p className="text-[#F5F0E6]/80 font-light leading-relaxed text-base">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 text-center"
        >
          <h2 className="text-2xl font-serif font-semibold text-[#F5F0E6] mb-3">
            Still have questions?
          </h2>
          <p className="text-[#F5F0E6]/70 mb-6">
            Our team of art advisors is ready to help. Reach out to us anytime.
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-[#D4AF37] text-[#0B3B2E] font-semibold rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wide text-sm"
          >
            Contact Us
          </a>
        </motion.div>
      </div>
    </div>
  );
}
