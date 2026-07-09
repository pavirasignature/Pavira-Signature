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

  const categoryColors = [
    "from-primary to-accent",
    "from-[#0B3B2E] to-[#D4B06A]",
    "from-[#07241D] to-[#E6C78B]",
    "from-[#0B3B2E] to-[#E6C78B]",
    "from-[#07241D] to-[#D4B06A]",
    "from-primary to-accent",
  ];

  return (
    <section className="relative min-h-screen py-20 bg-transparent overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#0B3B2E]/10 rounded-full blur-3xl animate-pulse animation-delay-4000" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-accent" size={24} />
            <span className="text-[#D4B06A] font-semibold uppercase tracking-widest text-sm">
              Explore Collections
            </span>
            <Sparkles className="text-accent" size={24} />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] mb-4 leading-tight">
            Premium{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#0B3B2E]">
              Categories
            </span>
          </h2>
          <p className="text-[#1A1A1A]/70 max-w-2xl mx-auto text-lg">
            Discover our curated collection of luxury home decor products
          </p>
        </motion.div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-800 rounded-xl animate-pulse"
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
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer relative"
                >
                  <Link href={`/products?category=${category.slug}`}>
                    <div className="relative h-72 rounded-2xl overflow-hidden bg-black/40 border border-white/10 hover:border-accent shadow-xl transition-all duration-500 ease-out">
                      {/* Premium Background Image */}
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={categoryImg}
                          alt={category.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover scale-100 group-hover:scale-110 transition-transform duration-700 ease-out opacity-40 group-hover:opacity-50"
                        />
                      </div>

                      {/* Luxury Dark Gradient Glow Layer */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 group-hover:via-black/60 group-hover:to-black/20 z-10 transition-all duration-500" />

                      {/* Hover Colored Accent Glow Layer */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${categoryColors[index % categoryColors.length]} opacity-0 group-hover:opacity-10 z-20 transition-opacity duration-500`}
                      />

                      {/* Content Panel */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-30 transition-all duration-500">
                        {/* Floating Icon Circular Glow Frame */}
                        <div className="w-20 h-20 rounded-full bg-secondary/80 border border-white/10 group-hover:border-accent/50 shadow-lg flex items-center justify-center mb-5 transform scale-100 group-hover:scale-110 group-hover:translate-y-[-4px] transition-all duration-500 ease-out">
                          <span className="text-3xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                            {categoryIcon}
                          </span>
                        </div>

                        {/* Category Name */}
                        <h3 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-foreground text-center mb-1 group-hover:text-accent tracking-tight transition-colors duration-300">
                          {category.name}
                        </h3>

                        {/* Product Count Badge */}
                        <p className="text-white/70 text-xs font-[family-name:var(--font-inter)] tracking-widest uppercase mb-6 group-hover:text-accent/90 transition-colors duration-300">
                          {category.productCount || "Multiple"} Masterpieces
                        </p>

                        {/* Premium "Explore Collection" Button */}
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-accent text-primary-foreground font-semibold rounded-lg opacity-0 translate-y-[10px] group-hover:opacity-100 group-hover:translate-y-0 shadow-lg transition-all duration-500 transform ease-out font-[family-name:var(--font-inter)] text-sm">
                          Explore Collection
                          <ChevronRight size={14} className="stroke-[3]" />
                        </div>
                      </div>

                      {/* Thin Gold Laser Frame Highlight */}
                      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-accent/30 pointer-events-none z-40 transition-all duration-500" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-accent transition"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
