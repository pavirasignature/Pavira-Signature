"use client";

import { useState, useEffect } from "react";
import ProductCard, { ProductSkeleton } from "@/components/ProductCard";
import { productService, categoryService } from "@/lib/services";
import { Search, ArrowRight } from "lucide-react";
import { useToast } from "@/components/Toast";
import Link from "next/link";

export default function ProductsClient() {
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
            (c) =>
              c.slug === categoryParam ||
              c._id === categoryParam ||
              c.id === categoryParam
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
  }, [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.search,
    filters.sort,
  ]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts(filters);
      const list = response.data?.products || response.data || [];
      setProducts(Array.isArray(list) ? list : []);
    } catch (error) {
      toast("Failed to fetch collection", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
      {/* COLLECTION HEADER */}
      <section className="pt-32 pb-16 px-6 bg-[#F2EFE9] border-b border-border/60 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.35em] text-[#0C3A2E] font-semibold mb-3">
            The Art of Luxury
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-brand text-[#1A1A1A] leading-tight mb-4">
            Curated Décor Collections
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-light max-w-xl mx-auto">
            Architectural wall clocks, precision-layered metal art, and statement
            panels engineered and finished in Ahmedabad.
          </p>
        </div>
      </section>

      {/* FILTER BAR (Sticky) */}
      <div className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto max-w-7xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search by name, material, or style..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F9F6F0] border border-border pl-10 pr-4 py-2.5 text-xs text-[#1A1A1A] placeholder-muted-foreground focus:outline-none focus:border-[#0C3A2E] transition-colors"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="w-full md:w-auto flex flex-wrap md:flex-nowrap gap-3 items-center justify-center">
            {/* Category Dropdown */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="bg-[#F9F6F0] border border-border px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#0C3A2E] cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.id} value={cat._id || cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Price Inputs */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="number"
                min={0}
                placeholder="Min ₹"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-20 bg-[#F9F6F0] border border-border px-2.5 py-2.5 text-xs text-[#1A1A1A] text-center focus:outline-none focus:border-[#0C3A2E]"
              />
              <span>–</span>
              <input
                type="number"
                min={0}
                placeholder="Max ₹"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-20 bg-[#F9F6F0] border border-border px-2.5 py-2.5 text-xs text-[#1A1A1A] text-center focus:outline-none focus:border-[#0C3A2E]"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className="bg-[#F9F6F0] border border-border px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#0C3A2E] cursor-pointer"
            >
              <option value="-createdAt">Newest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* PRODUCTS GRID SECTION */}
      <main className="py-16 pb-28">
        <div className="container mx-auto px-6 max-w-7xl">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-28 max-w-md mx-auto">
              <h3 className="text-2xl font-brand text-[#1A1A1A] mb-2">
                No Pieces Found
              </h3>
              <p className="text-muted-foreground font-light text-sm mb-6">
                No items match your selected filters. Please adjust your price
                range or category criteria.
              </p>
              <button
                onClick={() => {
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
                }}
                className="px-6 py-2.5 bg-[#0C3A2E] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#0C3A2E]/90 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* TRADE & BESPOKE INQUIRY CALLOUT */}
      <section className="py-20 bg-[#F2EFE9] border-t border-border/60">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold mb-2">
            Bespoke & Commercial
          </p>
          <h2 className="text-3xl md:text-4xl font-brand text-[#1A1A1A] mb-4">
            Need Custom Dimensions or Bulk Specifications?
          </h2>
          <p className="text-muted-foreground font-light text-sm leading-relaxed mb-8 max-w-xl mx-auto">
            We work directly with architects, interior designers, and hospitality
            planners to fabricate custom sizes, finish colorways, and multi-piece
            installations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/professionals"
              className="inline-flex items-center gap-2 bg-[#0C3A2E] text-white hover:bg-[#0C3A2E]/90 px-8 py-3.5 text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              <span>Explore Trade Program</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/contact?subject=Custom Order"
              className="inline-flex items-center gap-2 border border-[#0C3A2E] text-[#0C3A2E] hover:bg-[#0C3A2E] hover:text-white px-8 py-3.5 text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              <span>Request Consultation</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
