"use client";

import React from "react";
import { motion } from "framer-motion";

export default function FaqClient() {
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

  return (
    <div className="min-h-screen bg-[#F8F7F3] pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-brand text-[#0C3A2E] mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 font-light text-lg">
            Find answers to common questions about our products, craftsmanship, bespoke orders, and shipping.
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
              <h3 className="text-xl font-brand text-[#0C3A2E] mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
