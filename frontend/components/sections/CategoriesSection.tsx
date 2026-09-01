"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { categoryAPI } from "@/lib/api";
import { ChevronRight, Sparkles } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: any;
  icon?: string;
  description?: string;
  productCount?: number;
}

const getCategoryIcon = (slug: string, apiIcon?: string) => {
  if (apiIcon && apiIcon.trim()) return apiIcon;
  const s = slug.toLowerCase();
  if (s.includes("wall-art")) return "🎨";
  if (s.includes("clock")) return "⏰";
  if (s.includes("layer")) return "🎭";
  if (s.includes("gift")) return "🎁";
  if (s.includes("mdf")) return "🏗️";
  if (s.includes("door") || s.includes("grill")) return "🚪";
  return "✨";
};

const getCategoryImg = (slug: string, apiImg?: any) => {
  // Helper to validate remote URL
  const isValidRemoteUrl = (url: string) => {
    if (!url) return false;
    if (
      url.includes("file://") ||
      url.includes("D:") ||
      url.includes("Downloads")
    )
      return false;
    if (url.startsWith("http://") || url.startsWith("https://")) return true;
    return false;
  };

  if (apiImg) {
    if (typeof apiImg === "string" && isValidRemoteUrl(apiImg)) return apiImg;
    if (apiImg.url && isValidRemoteUrl(apiImg.url)) return apiImg.url;
  }

  const s = slug.toLowerCase();
  if (s.includes("wall-art"))
    return "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80";
  if (s.includes("clock"))
    return "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80";
  if (s.includes("layer"))
    return "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80";
  if (s.includes("gift"))
    return "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80";
  if (s.includes("mdf"))
    return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
  if (s.includes("door") || s.includes("grill"))
    return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80";
  return "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80";
};

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryAPI.getAll();
        if (response.data.success) {
          setCategories(response.data.data || []);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(fetchCategories, retryDelay);
          return;
        }
        setError("Failed to load categories");
        // Fallback categories for demo
        setCategories([
          { _id: "1", name: "Wall Arts", slug: "wall-arts", productCount: 24 },
          {
            _id: "2",
            name: "Wall Clocks",
            slug: "wall-clocks",
            productCount: 18,
          },
          {
            _id: "3",
            name: "3D Layer Arts",
            slug: "3d-layer-arts",
            productCount: 32,
          },
          {
            _id: "4",
            name: "Gift Articles",
            slug: "gift-articles",
            productCount: 15,
          },
          {
            _id: "5",
            name: "3D MDF Arts",
            slug: "3d-mdf-arts",
            productCount: 28,
          },
          {
            _id: "6",
            name: "Main Door Grills",
            slug: "main-door-grills",
            productCount: 12,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="relative py-24 bg-gradient-to-b from-[#0B3B2E] via-[#07271F] to-[#0B3B2E] overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D4AF37]/3 rounded-full blur-3xl animate-pulse delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#D4AF37]/2 rounded-full blur-3xl animate-pulse delay-4000" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-6 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 w-fit mx-auto"
          >
            <Sparkles className="text-[#D4AF37]" size={20} strokeWidth={1.5} />
            <span className="text-[#D4AF37] font-semibold uppercase tracking-widest text-xs">
              Premium Collections
            </span>
            <Sparkles className="text-[#D4AF37]" size={20} strokeWidth={1.5} />
          </motion.div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-[#F5F0E6] mb-6 leading-tight">
            Luxury{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#D4AF37] to-[#D4AF37]/80">
              Categories
            </span>
          </h2>
          <p className="text-[#F5F0E6]/70 max-w-2xl mx-auto text-lg font-light">
            Explore our exquisite collection of handcrafted luxury home decor products
          </p>
        </motion.div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-72 bg-[#112F24]/40 backdrop-blur rounded-2xl border border-[#D4AF37]/10 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {categories.map((category, index) => {
              const categoryImg = getCategoryImg(category.slug, category.image);
              const categoryIcon = getCategoryIcon(
                category.slug,
                category.icon,
              );
              return (
                <motion.div
                  key={category._id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer relative"
                >
                  <Link href={`/products?category=${category.slug}`}>
                    <div className="relative h-72 rounded-2xl overflow-hidden bg-[#0B3B2E] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 shadow-2xl transition-all duration-500 ease-out">
                      {/* Premium Background Image */}
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={categoryImg}
                          alt={category.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover scale-100 group-hover:scale-120 transition-transform duration-700 ease-out opacity-30 group-hover:opacity-40"
                        />
                      </div>

                      {/* Luxury Dark Gradient Glow Layer */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B3B2E]/95 via-[#0B3B2E]/60 to-[#0B3B2E]/20 group-hover:from-[#0B3B2E]/98 group-hover:via-[#0B3B2E]/70 group-hover:to-[#0B3B2E]/30 z-10 transition-all duration-500" />

                      {/* Gold Accent Glow Layer */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/0 via-[#D4AF37]/0 to-[#D4AF37]/0 group-hover:from-[#D4AF37]/5 group-hover:via-[#D4AF37]/2 group-hover:to-[#D4AF37]/5 z-20 transition-all duration-500" />

                      {/* Content Panel */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-30 transition-all duration-500">
                        {/* Floating Icon Circular Glow Frame */}
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 10 }}
                          className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border-2 border-[#D4AF37]/40 group-hover:border-[#D4AF37]/70 shadow-xl flex items-center justify-center mb-6 transition-all duration-500 ease-out group-hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                        >
                          <span className="text-5xl drop-shadow-lg filter brightness-110">
                            {categoryIcon}
                          </span>
                        </motion.div>

                        {/* Category Name */}
                        <h3 className="text-3xl font-serif font-bold text-[#F5F0E6] text-center mb-2 group-hover:text-[#D4AF37] tracking-tight transition-colors duration-300">
                          {category.name}
                        </h3>

                        {/* Product Count Badge */}
                        <motion.p
                          initial={{ opacity: 0.7 }}
                          whileHover={{ opacity: 1 }}
                          className="text-[#D4AF37]/80 text-xs font-semibold tracking-widest uppercase mb-8 group-hover:text-[#D4AF37] transition-colors duration-300"
                        >
                          {category.productCount || "Multiple"} Masterpieces
                        </motion.p>

                        {/* Premium "Explore Collection" Button */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#D4AF37]/80 hover:from-[#D4AF37]/90 hover:to-[#D4AF37]/70 text-[#0B3B2E] font-bold rounded-full shadow-lg transition-all duration-300 transform uppercase text-sm tracking-wide group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                        >
                          Explore
                          <ChevronRight size={16} strokeWidth={2.5} />
                        </motion.div>
                      </div>

                      {/* Premium Gold Frame Highlight */}
                      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-[#D4AF37]/30 pointer-events-none z-40 transition-all duration-500" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-[#F5F0E6]/60 mb-6 text-lg">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-[#D4AF37] text-[#0B3B2E] font-semibold rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 uppercase tracking-wide"
            >
              Try Again
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
