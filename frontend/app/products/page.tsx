"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import PublicLayout from "@/components/layout/PublicLayout";
import ProductCard, { ProductSkeleton } from "@/components/ProductCard";
import { productService, categoryService } from "@/lib/services";
import { motion, AnimatePresence, useScroll, useTransform, Variants } from "framer-motion";
import { Search } from "lucide-react";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { PremiumMandala } from "@/components/PremiumVisuals";

// Dynamically import the heavy visual background effects to avoid blocking initial render
const PremiumVisuals = dynamic(() => import("@/components/PremiumVisuals"), { ssr: false });

// Stagger animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: "",
    minPrice: 0,
    maxPrice: 100000,
    search: "",
    sort: "-createdAt",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const mandalaRotate = useTransform(scrollYProgress, [0, 1], [0, 180]);

  useEffect(() => {
    const loadCategoriesAndQueryParams = async () => {
      let fetchedCategories: any[] = [];
      try {
        const response = await categoryService.getCategories();
        fetchedCategories = response.data?.data || response.data || [];
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const categoryParam = params.get("category");
        const searchParam = params.get("search");

        let categoryId = "";
        if (categoryParam && fetchedCategories.length > 0) {
          const matched = fetchedCategories.find(
            (c) => c.slug === categoryParam || c._id === categoryParam || c.id === categoryParam
          );
          if (matched) {
            categoryId = matched._id || matched.id;
          }
        }

        if (categoryId || searchParam) {
          setFilters((prev) => ({
            ...prev,
            category: categoryId || prev.category,
            search: searchParam || prev.search,
          }));
          if (searchParam) setSearchTerm(searchParam);
        }
      }
    };
    loadCategoriesAndQueryParams();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchTerm,
        minPrice: minPriceInput ? Number(minPriceInput) : 0,
        maxPrice: maxPriceInput ? Number(maxPriceInput) : 100000,
      }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, minPriceInput, maxPriceInput]);

  useEffect(() => {
    fetchProducts();
  }, [filters.category, filters.minPrice, filters.maxPrice, filters.search, filters.sort]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts(filters);
      setProducts(response.data || []);
    } catch (error) {
      toast("Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const featuredProducts = products.slice(0, 2);
  const galleryProducts = products.slice(2);

  return (
    <PublicLayout>
    <div className="min-h-screen bg-[#0B3B2E] text-[#F5F0E6] overflow-x-hidden selection:bg-[#D4AF37] selection:text-[#0B3B2E] font-sans">
      <PremiumVisuals />

      {/* COLLECTION HERO */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 overflow-hidden z-10">
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] md:w-[80vw] h-[150vw] md:h-[80vw] opacity-[0.03] pointer-events-none mix-blend-screen"
          style={{ rotate: mandalaRotate }}
        >
          <PremiumMandala />
        </motion.div>
        
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="text-[#D4AF37] uppercase tracking-[0.3em] text-xs font-bold mb-6"
          >
            Curated Exhibition
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-serif font-medium leading-[1.1] mb-8 tracking-tight drop-shadow-2xl text-white"
          >
            The Signature <br/> <span className="italic font-light text-[#D4AF37]">Gallery.</span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100px" }}
            transition={{ duration: 1.5, delay: 1 }}
            className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          />
        </motion.div>
      </section>

      {/* LUXURY FILTER BAR (Sticky) */}
      <div className="sticky top-[72px] z-40 bg-[#0B3B2E]/70 backdrop-blur-xl border-y border-[#D4AF37]/20 shadow-2xl transition-all duration-300">
        <div className="container mx-auto max-w-7xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-1/3 group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/60 group-focus-within:text-[#D4AF37] transition-colors" />
            <input
              type="text"
              placeholder="Search masterpieces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#112F24]/50 border border-[#D4AF37]/20 rounded-full pl-11 pr-4 py-2.5 text-xs text-[#F5F0E6] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37]/60 focus:bg-[#112F24]/80 transition-all shadow-inner"
            />
          </div>
          
          <div className="w-full md:w-auto flex flex-wrap md:flex-nowrap gap-3 items-center justify-center">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="bg-[#112F24]/50 border border-[#D4AF37]/20 rounded-full px-4 py-2.5 text-xs text-[#F5F0E6] focus:outline-none focus:border-[#D4AF37]/60 appearance-none cursor-pointer pr-8 hover:bg-[#112F24]/80 transition-all"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23D4AF37%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
            >
              <option value="" className="bg-[#0B3B2E]">All Collections</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.id} value={cat._id || cat.id} className="bg-[#0B3B2E]">
                  {cat.name}
                </option>
              ))}
            </select>
            
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                placeholder="Min ₹"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-24 bg-[#112F24]/50 border border-[#D4AF37]/20 rounded-full px-3 py-2.5 text-xs text-[#F5F0E6] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/60 text-center transition-all"
              />
              <span className="text-[#D4AF37]/50">-</span>
              <input
                type="number"
                min={0}
                placeholder="Max ₹"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-24 bg-[#112F24]/50 border border-[#D4AF37]/20 rounded-full px-3 py-2.5 text-xs text-[#F5F0E6] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/60 text-center transition-all"
              />
            </div>

            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className="bg-[#112F24]/50 border border-[#D4AF37]/20 rounded-full px-4 py-2.5 text-xs text-[#F5F0E6] focus:outline-none focus:border-[#D4AF37]/60 appearance-none cursor-pointer pr-8 hover:bg-[#112F24]/80 transition-all"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23D4AF37%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
            >
              <option value="-createdAt" className="bg-[#0B3B2E]">Latest Arrivals</option>
              <option value="price" className="bg-[#0B3B2E]">Price: Ascending</option>
              <option value="-price" className="bg-[#0B3B2E]">Price: Descending</option>
              <option value="-rating" className="bg-[#0B3B2E]">Exceptional Quality</option>
            </select>
          </div>
        </div>
      </div>

      <main className="relative z-10 pt-16 pb-32">
        <div className="container mx-auto px-6 max-w-7xl">
          
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
              </motion.div>
            ) : products.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-32"
              >
                <div className="w-24 h-24 mx-auto mb-6 opacity-20"><PremiumMandala /></div>
                <h3 className="text-2xl font-serif text-[#D4AF37] mb-2">No Masterpieces Found</h3>
                <p className="text-gray-400 font-light text-sm">Adjust your filters to explore our collection.</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-12"
              >
                {/* FEATURED COLLECTION (Asymmetrical) */}
                {featuredProducts.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {featuredProducts.map((product) => (
                      <motion.div key={product._id || product.id} variants={itemVariants}>
                        <ProductCard product={product} priority={true} />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* INFINITE GALLERY (Standard Grid) */}
                {galleryProducts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {galleryProducts.map((product) => (
                      <motion.div key={product._id || product.id} variants={itemVariants}>
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* COLLECTION CTA */}
      <section className="relative py-32 border-t border-[#D4AF37]/20 bg-[#07241D] overflow-hidden z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] opacity-5 pointer-events-none mix-blend-screen">
          <PremiumMandala />
        </div>
        <div className="container mx-auto px-6 text-center relative z-10 max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-serif text-[#D4AF37] mb-6">Desire Something Unique?</h2>
          <p className="text-gray-300 mb-10 font-light text-sm leading-relaxed">
            Our artisans are available for private commissions. Work directly with our design team to create a bespoke mandala tailored to your exact dimensions, color palette, and spiritual intentions.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-4 group cursor-pointer bg-[#0B3B2E] px-8 py-4 rounded-full border border-[#D4AF37]/30 hover:bg-[#D4AF37] transition-all duration-500 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <span className="text-xs tracking-widest uppercase font-bold text-[#D4AF37] group-hover:text-[#0B3B2E] transition-colors">Commission a Piece</span>
          </Link>
        </div>
      </section>

    </div>
    </PublicLayout>
  );
}
