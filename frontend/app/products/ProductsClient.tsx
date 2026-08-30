"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard, { ProductSkeleton } from "@/components/ProductCard";
import QuickViewModal from "@/components/QuickViewModal";
import { productService, categoryService } from "@/lib/services";
import {
  Search,
  ArrowRight,
  SlidersHorizontal,
  X,
  ChevronDown,
  Shield,
  Truck,
  Award,
  HeadphonesIcon,
  Star,
  ArrowLeft,
  Instagram,
} from "lucide-react";
import { useToast } from "@/components/Toast";

/* ─── Category Tiles ─── */
const COLLECTION_TILES = [
  {
    title: "Wall Clocks",
    slug: "wall-clocks",
    image:
      "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Wall Art",
    slug: "wall-arts",
    image:
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Canvas Art",
    slug: "canvas",
    image:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Decorative Mirrors",
    slug: "decorative-mirrors",
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Sculptural Décor",
    slug: "sculptural-decor",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "New Arrivals",
    slug: "__new",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Best Sellers",
    slug: "__best",
    image:
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Custom Designs",
    slug: "__custom",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
  },
];

/* ─── Shop by Space ─── */
const SPACES = [
  {
    name: "Living Room",
    image:
      "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=900&q=80",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    name: "Bedroom",
    image:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80",
    span: "",
  },
  {
    name: "Dining Room",
    image:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
    span: "",
  },
  {
    name: "Entryway",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
    span: "",
  },
  {
    name: "Office",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
    span: "",
  },
];

/* ─── Reviews ─── */
const REVIEWS = [
  {
    name: "Ananya Sharma",
    location: "Mumbai, Maharashtra",
    rating: 5,
    text: "The Aurelia Grande clock is absolutely stunning. The metallic finish catches light beautifully and it's become the centrepiece of our living room. Packaging was immaculate.",
  },
  {
    name: "Rohan Mehta",
    location: "Ahmedabad, Gujarat",
    rating: 5,
    text: "We ordered custom wall panels for our restaurant. The Pavira team was incredibly responsive and the final pieces exceeded our expectations. True artisanship.",
  },
  {
    name: "Priya Kapoor",
    location: "New Delhi",
    rating: 5,
    text: "I've purchased three pieces now and each one is better than the last. The quality of materials and the attention to detail is unmatched. Highly recommend.",
  },
];

/* ─── Instagram Images ─── */
const INSTAGRAM_IMAGES = [
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=400&q=80",
];

/* ═══════════════════════════════════════ MAIN COMPONENT ═══════════════════════════════════════ */

export default function ProductsClient() {
  const toast = useToast();

  /* ── Products & Categories ── */
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  /* ── Filters ── */
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /* ── Quick View ── */
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  /* ── Newsletter ── */
  const [email, setEmail] = useState("");

  /* ── Refs ── */
  const catalogueRef = useRef<HTMLDivElement>(null);
  const collectionsRef = useRef<HTMLDivElement>(null);

  /* ─── Load categories + URL params ─── */
  useEffect(() => {
    const load = async () => {
      let fetched: any[] = [];
      try {
        const res = await categoryService.getCategories();
        fetched = res.data?.data || res.data || [];
        setCategories(fetched);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const catParam = params.get("category");
        const searchParam = params.get("search");
        let catId = "";
        if (catParam && fetched.length > 0) {
          const matched = fetched.find(
            (c) => c.slug === catParam || c._id === catParam || c.id === catParam
          );
          if (matched) catId = matched._id || matched.id;
        }
        if (catId || searchParam) {
          setFilters((prev) => ({
            ...prev,
            category: catId || prev.category,
            search: searchParam || prev.search,
          }));
          if (searchParam) setSearchTerm(searchParam);
        }
      }
    };
    load();
  }, []);

  /* ─── Load featured products ─── */
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await productService.getProducts({ sort: "-rating", limit: 8 });
        const list = res.data?.products || res.data || [];
        setFeaturedProducts(Array.isArray(list) ? list.slice(0, 8) : []);
      } catch {
        // silently fail
      } finally {
        setLoadingFeatured(false);
      }
    };
    loadFeatured();
  }, []);

  /* ─── Debounced search / price inputs ─── */
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

  /* ─── Fetch products on filter change ─── */
  useEffect(() => {
    fetchProducts();
  }, [filters.category, filters.minPrice, filters.maxPrice, filters.search, filters.sort]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts(filters);
      const list = response.data?.products || response.data || [];
      setProducts(Array.isArray(list) ? list : []);
    } catch {
      toast("Failed to fetch collection", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  /* ─── Collection tile click ─── */
  const handleCollectionClick = (slug: string) => {
    if (slug === "__custom") {
      window.location.href = "/contact?subject=Custom Order";
      return;
    }
    if (slug === "__new") {
      setFilters((prev) => ({ ...prev, category: "", sort: "-createdAt" }));
    } else if (slug === "__best") {
      setFilters((prev) => ({ ...prev, category: "", sort: "-rating" }));
    } else {
      const matched = categories.find((c) => c.slug === slug);
      if (matched) {
        setFilters((prev) => ({
          ...prev,
          category: matched._id || matched.id || "",
        }));
      }
    }
    catalogueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ─── Reset filters ─── */
  const resetFilters = () => {
    setSearchTerm("");
    setMinPriceInput("");
    setMaxPriceInput("");
    setFilters({
      category: "",
      minPrice: 0,
      maxPrice: 100000,
      search: "",
      sort: "-createdAt",
    });
  };

  const hasActiveFilters =
    filters.category || filters.search || filters.minPrice > 0 || filters.maxPrice < 100000;

  /* ═══ RENDER ═══ */
  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#1A1A1A] overflow-x-hidden font-sans">
      {/* ────────────────────────── §1 COLLECTION HERO ────────────────────────── */}
      <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
        {/* Hero Image */}
        <Image
          src="/collections-hero.jpg"
          alt="Luxury interior with Pavira Signature wall décor"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F9F6F0]/90 via-[#F9F6F0]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F9F6F0]/40 via-transparent to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 md:px-12 max-w-7xl">
            <div className="max-w-xl">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#0C3A2E] font-semibold mb-4">
                The Collection
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1A1A1A] leading-[1.1] mb-5">
                Designed for Spaces
                <br />
                <span className="italic font-light">That Inspire.</span>
              </h1>
              <p className="text-sm md:text-base text-[#1A1A1A]/70 font-light leading-relaxed max-w-md mb-8">
                Discover statement pieces crafted to bring character, warmth and
                timeless elegance to your interiors.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    catalogueRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  className="bg-[#0C3A2E] text-white px-8 py-3.5 text-[11px] uppercase tracking-widest font-semibold hover:bg-[#0C3A2E]/90 transition-colors"
                >
                  Shop All
                </button>
                <button
                  onClick={() =>
                    collectionsRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  className="border border-[#0C3A2E] text-[#0C3A2E] px-8 py-3.5 text-[11px] uppercase tracking-widest font-semibold hover:bg-[#0C3A2E] hover:text-white transition-colors"
                >
                  Explore Collections
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────── §2 SHOP BY COLLECTION ────────────────────────── */}
      <section ref={collectionsRef} className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="text-center mb-14">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#D4AF37] font-semibold mb-3">
              Curated for You
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-[#1A1A1A]">
              Explore Our Collections
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {COLLECTION_TILES.map((tile) => (
              <button
                key={tile.slug}
                onClick={() => handleCollectionClick(tile.slug)}
                className="group/tile relative aspect-[3/4] overflow-hidden text-left"
              >
                <Image
                  src={tile.image}
                  alt={tile.title}
                  fill
                  className="object-cover scale-100 group-hover/tile:scale-105 transition-transform duration-700"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover/tile:from-black/70 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <h3 className="text-white text-sm md:text-base font-serif mb-1">
                    {tile.title}
                  </h3>
                  <span className="text-white/70 text-[10px] uppercase tracking-widest font-medium opacity-0 group-hover/tile:opacity-100 transform translate-y-2 group-hover/tile:translate-y-0 transition-all duration-300 flex items-center gap-1">
                    Explore <ArrowRight size={11} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────── §3 FEATURED / BESTSELLING ────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#F9F6F0]">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="text-center mb-14">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#D4AF37] font-semibold mb-3">
              Customer Favourites
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-[#1A1A1A]">
              Most Loved by Our Customers
            </h2>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.slice(0, 4).map((product, i) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  priority={i < 2}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ────────────────────────── §4 FILTER BAR + §5 CATALOGUE ────────────────────────── */}
      <div ref={catalogueRef} className="bg-white">
        {/* Filter Bar — Sticky */}
        <div className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-md border-b border-border/60 shadow-sm">
          <div className="container mx-auto max-w-7xl px-6 md:px-12 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Left — Product Count */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-xs text-muted-foreground font-medium">
                {loading ? "..." : `${products.length} Products`}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[10px] text-[#A85751] hover:text-[#A85751]/80 uppercase tracking-widest font-semibold flex items-center gap-1"
                >
                  <X size={11} /> Clear Filters
                </button>
              )}
            </div>

            {/* Center — Search + Filter Toggle */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-72">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#F9F6F0] border border-border/60 pl-10 pr-4 py-2.5 text-xs text-[#1A1A1A] placeholder-muted-foreground focus:outline-none focus:border-[#0C3A2E] transition-colors"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 text-[11px] uppercase tracking-widest font-semibold border transition-colors ${
                  isFilterOpen
                    ? "bg-[#0C3A2E] text-white border-[#0C3A2E]"
                    : "bg-white text-[#1A1A1A] border-border/60 hover:border-[#1A1A1A]/30"
                }`}
              >
                <SlidersHorizontal size={13} />
                Filter
              </button>
            </div>

            {/* Right — Sort */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium hidden md:inline">
                Sort by
              </span>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="bg-[#F9F6F0] border border-border/60 px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#0C3A2E] cursor-pointer flex-1 md:flex-none"
              >
                <option value="-createdAt">Newest</option>
                <option value="-rating">Best Selling</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Expanded Filter Panel */}
          {isFilterOpen && (
            <div className="border-t border-border/40 bg-white">
              <div className="container mx-auto max-w-7xl px-6 md:px-12 py-5">
                <div className="flex flex-wrap items-end gap-4 md:gap-6">
                  {/* Category */}
                  <div className="flex-1 min-w-[150px]">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5 block">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        handleFilterChange("category", e.target.value)
                      }
                      className="w-full bg-[#F9F6F0] border border-border/60 px-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#0C3A2E] cursor-pointer"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option
                          key={cat._id || cat.id}
                          value={cat._id || cat.id}
                        >
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5 block">
                      Price Range
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        placeholder="Min ₹"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(e.target.value)}
                        className="w-full bg-[#F9F6F0] border border-border/60 px-3 py-2.5 text-xs text-[#1A1A1A] text-center focus:outline-none focus:border-[#0C3A2E]"
                      />
                      <span className="text-xs text-muted-foreground">–</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="Max ₹"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        className="w-full bg-[#F9F6F0] border border-border/60 px-3 py-2.5 text-xs text-[#1A1A1A] text-center focus:outline-none focus:border-[#0C3A2E]"
                      />
                    </div>
                  </div>

                  {/* Apply / Clear */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="px-5 py-2.5 bg-[#0C3A2E] text-white text-[10px] uppercase tracking-widest font-semibold hover:bg-[#0C3A2E]/90 transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      onClick={resetFilters}
                      className="px-5 py-2.5 border border-border/60 text-[#1A1A1A] text-[10px] uppercase tracking-widest font-semibold hover:bg-[#F2EFE9] transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Grid */}
        <main className="py-12 md:py-16">
          <div className="container mx-auto px-6 md:px-12 max-w-7xl">
            {/* Mobile product count */}
            <div className="flex md:hidden items-center justify-between mb-5">
              <span className="text-xs text-muted-foreground font-medium">
                {loading ? "Loading..." : `${products.length} Products`}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[10px] text-[#A85751] uppercase tracking-widest font-semibold flex items-center gap-1"
                >
                  <X size={10} /> Clear
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-28 max-w-md mx-auto">
                <h3 className="text-2xl font-serif text-[#1A1A1A] mb-2">
                  No Pieces Found
                </h3>
                <p className="text-muted-foreground font-light text-sm mb-6">
                  No items match your current filters. Try adjusting your search
                  criteria or browse all products.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-8 py-3 bg-[#0C3A2E] text-white text-[11px] uppercase tracking-widest font-semibold hover:bg-[#0C3A2E]/90 transition-colors"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product, idx) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    priority={idx < 4}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ────────────────────────── §6 TRUST / PURCHASE CONFIDENCE ────────────────────────── */}
      <section className="py-16 md:py-20 bg-[#F9F6F0] border-t border-border/40">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              {
                icon: Award,
                title: "Premium Craftsmanship",
                desc: "Thoughtfully designed and meticulously finished.",
              },
              {
                icon: Shield,
                title: "Secure Packaging",
                desc: "Carefully packed for safe delivery.",
              },
              {
                icon: Star,
                title: "Quality Assured",
                desc: "Made with premium materials and attention to detail.",
              },
              {
                icon: HeadphonesIcon,
                title: "Dedicated Support",
                desc: "Our team is here to assist you.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4">
                  <item.icon
                    size={24}
                    strokeWidth={1.2}
                    className="text-[#0C3A2E]"
                  />
                </div>
                <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A] mb-1.5">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────── §7 SHOP BY SPACE ────────────────────────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="text-center mb-14">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#D4AF37] font-semibold mb-3">
              Styled Interiors
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-[#1A1A1A]">
              Find the Perfect Piece for Your Space
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 md:gap-4">
            {SPACES.map((space, idx) => (
              <Link
                key={space.name}
                href={`/products?search=${encodeURIComponent(space.name)}`}
                className={`group/space relative overflow-hidden ${
                  idx === 0
                    ? "col-span-2 row-span-2 aspect-square md:aspect-auto"
                    : "aspect-[4/5]"
                }`}
              >
                <Image
                  src={space.image}
                  alt={`Shop ${space.name} décor`}
                  fill
                  className="object-cover scale-100 group-hover/space:scale-105 transition-transform duration-700"
                  sizes={
                    idx === 0
                      ? "(max-width: 768px) 100vw, 50vw"
                      : "(max-width: 768px) 50vw, 25vw"
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3 className="text-white font-serif text-base md:text-lg mb-1">
                    {space.name}
                  </h3>
                  <span className="text-white/70 text-[10px] uppercase tracking-widest font-medium flex items-center gap-1 group-hover/space:text-white transition-colors">
                    Shop This Space <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────── §8 CUSTOM DESIGN CTA ────────────────────────── */}
      <section className="relative py-24 md:py-32 bg-[#0C3A2E] overflow-hidden">
        {/* Background decorative image */}
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1600&q=60"
            alt=""
            fill
            className="object-cover"
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 max-w-3xl text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-semibold mb-4">
            Bespoke Service
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white leading-tight mb-5">
            Make It Uniquely Yours.
          </h2>
          <p className="text-sm md:text-base text-white/70 font-light leading-relaxed max-w-xl mx-auto mb-10">
            Looking for a specific size, finish or design? Work with our team to
            create a piece made specifically for your space.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact?subject=Custom Order"
              className="bg-[#D4AF37] text-[#0C3A2E] px-8 py-3.5 text-[11px] uppercase tracking-widest font-semibold hover:bg-[#D4AF37]/90 transition-colors"
            >
              Request Custom Design
            </Link>
            <Link
              href="/contact"
              className="border border-white/40 text-white px-8 py-3.5 text-[11px] uppercase tracking-widest font-semibold hover:bg-white/10 transition-colors"
            >
              Contact an Expert
            </Link>
          </div>
        </div>
      </section>

      {/* ────────────────────────── §9 CUSTOMER REVIEWS ────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#F9F6F0]">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="text-center mb-14">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#D4AF37] font-semibold mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-[#1A1A1A]">
              Loved in Beautiful Spaces
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((review, idx) => (
              <div
                key={idx}
                className="bg-white p-8 border border-border/40"
              >
                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-[#D4AF37] text-[#D4AF37]"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-[#1A1A1A] font-light leading-relaxed mb-6 italic">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Author */}
                <div className="border-t border-border/40 pt-4">
                  <p className="text-xs font-semibold text-[#1A1A1A]">
                    {review.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {review.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────── §10 INSTAGRAM / VISUAL INSPIRATION ────────────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#D4AF37] font-semibold mb-3">
              @pavirasignature
            </p>
            <h2 className="text-2xl md:text-3xl font-serif text-[#1A1A1A]">
              Follow the Pavira World
            </h2>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {INSTAGRAM_IMAGES.map((img, idx) => (
              <a
                key={idx}
                href="https://instagram.com/pavirasignature"
                target="_blank"
                rel="noopener noreferrer"
                className="group/ig relative aspect-square overflow-hidden"
              >
                <Image
                  src={img}
                  alt="Pavira Signature interior"
                  fill
                  className="object-cover scale-100 group-hover/ig:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 33vw, 16vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/ig:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <Instagram
                    size={22}
                    className="text-white opacity-0 group-hover/ig:opacity-100 transition-opacity duration-300"
                  />
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://instagram.com/pavirasignature"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold text-[#0C3A2E] hover:text-[#D4AF37] transition-colors"
            >
              <Instagram size={15} />
              Follow Us
            </a>
          </div>
        </div>
      </section>

      {/* ────────────────────────── §11 NEWSLETTER ────────────────────────── */}
      <section className="py-20 md:py-24 bg-[#F2EFE9] border-t border-border/40">
        <div className="container mx-auto px-6 md:px-12 max-w-xl text-center">
          <h2 className="text-2xl md:text-3xl font-serif text-[#1A1A1A] mb-3">
            Stay Inspired.
          </h2>
          <p className="text-sm text-muted-foreground font-light leading-relaxed mb-8">
            Be the first to discover new collections, exclusive designs and
            inspiration for your space.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) {
                toast("Thank you for subscribing!", "success");
                setEmail("");
              }
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-white border border-border/60 px-5 py-3 text-sm text-[#1A1A1A] placeholder-muted-foreground focus:outline-none focus:border-[#0C3A2E] transition-colors"
            />
            <button
              type="submit"
              className="bg-[#0C3A2E] text-white px-8 py-3 text-[11px] uppercase tracking-widest font-semibold hover:bg-[#0C3A2E]/90 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* ────────────────────────── QUICK VIEW MODAL ────────────────────────── */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
