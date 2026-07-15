"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { productAPI, wishlistAPI } from "@/lib/api";
import { Heart, ShoppingCart, Star, ChevronDown } from "lucide-react";
import { getAbsoluteUrl, isExternalUrl } from "@/lib/config";
import Image from "next/image";
import { useStore } from "@/store/useStore";
import toast from "react-hot-toast";
import PublicLayout from "@/components/layout/PublicLayout";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  rating: number;
  category: any;
  image?: string;
  images?: { url: string }[];
  reviews?: any[];
  stock?: number;
  updatedAt?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string || "";
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, isInWishlist: checkStoreWishlist, token } = useStore();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "description",
  );

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getOne(productId);
      const prod = response.data?.success ? response.data.data : response.data;
      setProduct(prod);
      if (prod && prod.stock === 0) {
        setQuantity(0);
      } else {
        setQuantity(1);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product && checkStoreWishlist) {
      setIsInWishlist(checkStoreWishlist(product._id));
    }
  }, [product, wishlist, checkStoreWishlist]);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const handleWishlist = async () => {
    if (!token) {
      toast.error("Please sign in to add items to your wishlist");
      router.push("/login");
      return;
    }
    if (!product) return;
    try {
      if (isInWishlist) {
        await wishlistAPI.remove(product._id);
        setIsInWishlist(false);
        removeFromWishlist(product._id);
        toast.success("Removed from wishlist");
      } else {
        await wishlistAPI.add(product._id);
        setIsInWishlist(true);
        addToWishlist(product._id);
        toast.success("Added to wishlist");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update wishlist");
    }
  };

  const handleAddToCart = () => {
    if (!token) {
      toast.error("Please sign in to add items to your cart");
      router.push("/login");
      return;
    }
    if (!product) return;
    if (product.stock === 0) {
      toast.error("please check our website after few time till then pls stay connect to us");
      return;
    }
    addToCart(product, quantity);
    toast.success("Added to cart");
  };

  const getProductImage = (product: Product) => {
    const isValidRemoteUrl = (url: string) => {
      if (!url) return false;
      if (
        url.includes("file://") ||
        url.includes("D:") ||
        url.includes("Downloads")
      )
        return false;
      return isExternalUrl(url) || url.startsWith("/") || url.startsWith("uploads/");
    };

    const withCacheBust = (url: string) => {
      const v = (product as any)?.updatedAt;
      if (!v) return url;
      if (url.includes("?")) return `${url}&v=${encodeURIComponent(String(v))}`;
      return `${url}?v=${encodeURIComponent(String(v))}`;
    };

    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (isValidRemoteUrl(img.url)) {
          return withCacheBust(getAbsoluteUrl(img.url));
        }
      }
    }

    if (product.image && isValidRemoteUrl(product.image)) {
      return withCacheBust(getAbsoluteUrl(product.image));
    }

    const name = product.name.toLowerCase();
    if (name.includes("lotus") || name.includes("wall art")) {
      return "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80";
    }
    if (name.includes("clock")) {
      return "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80";
    }
    if (name.includes("mandala")) {
      return "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80";
    }
    if (name.includes("candle") || name.includes("scented")) {
      return "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80";
    }
    if (name.includes("panels") || name.includes("mdf")) {
      return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
    }
    return "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80";
  };

  if (loading) {
    return (
      <PublicLayout>
      <main className="min-h-screen bg-[#1B2D20] text-foreground overflow-hidden relative">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />
        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            {/* Image Skeleton */}
            <div className="relative aspect-square w-full bg-secondary/40 rounded-2xl overflow-hidden border border-[#D4AF37]/10">
              <div className="absolute inset-0 animate-shimmer" />
            </div>

            {/* Product Info Skeleton */}
            <div className="flex flex-col justify-center space-y-6">
              {/* Category */}
              <div className="h-4 w-24 bg-white/5 rounded relative overflow-hidden">
                <div className="absolute inset-0 animate-shimmer" />
              </div>
              {/* Title */}
              <div className="h-10 w-3/4 bg-white/5 rounded relative overflow-hidden">
                <div className="absolute inset-0 animate-shimmer" />
              </div>
              {/* Rating */}
              <div className="h-5 w-40 bg-white/5 rounded relative overflow-hidden">
                <div className="absolute inset-0 animate-shimmer" />
              </div>
              {/* Price & Divider */}
              <div className="py-6 border-y border-white/5 space-y-3">
                <div className="h-12 w-32 bg-white/5 rounded relative overflow-hidden">
                  <div className="absolute inset-0 animate-shimmer" />
                </div>
                <div className="h-4 w-60 bg-white/5 rounded relative overflow-hidden">
                  <div className="absolute inset-0 animate-shimmer" />
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-4">
                <div className="h-12 w-28 bg-white/5 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 animate-shimmer" />
                </div>
                <div className="h-12 flex-1 bg-white/5 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 animate-shimmer" />
                </div>
                <div className="h-12 w-14 bg-white/5 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 animate-shimmer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </PublicLayout>
    );
  }

  if (!product) {
    return (
      <PublicLayout>
      <main className="min-h-screen bg-[#1B2D20] text-foreground flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />
        <div className="text-center relative z-10">
          <p className="text-gray-400 text-lg">Product not found</p>
        </div>
      </main>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
    <main className="min-h-screen bg-[#1B2D20] text-foreground relative overflow-hidden selection:bg-accent selection:text-accent-foreground">
      {/* Full Page Fixed Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-square w-full bg-secondary/40 rounded-2xl overflow-hidden border border-[#D4AF37]/20 flex items-center justify-center group"
          >
            <Image
              src={getProductImage(product)}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </motion.div>

          {/* Product Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            <p className="text-[#D4AF37] font-semibold uppercase tracking-wide mb-2">
              {typeof product.category === 'object' && product.category ? (product.category as any).name : product.category || "Decor"}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={`${
                      i < Math.round(product.rating)
                        ? "fill-[#D4AF37] text-[#D4AF37]"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400">
                {product.rating} ({product.reviews?.length || 12} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-8 pb-8 border-b border-secondary-foreground/20">
              <p className="text-5xl font-bold text-[#D4AF37] mb-2">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
              <p className="text-gray-400">
                Free shipping on orders above ₹1000
              </p>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity & Actions */}
            <div className="flex flex-col gap-4 mb-8">
              {/* Top Row: Wishlist & Quantity */}
              <div className="flex justify-between items-center w-full">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWishlist}
                  className={`p-3 border rounded-xl transition flex items-center justify-center ${
                    isInWishlist
                      ? "bg-[#D4AF37] text-[#07271F] border-[#D4AF37]"
                      : "border-[#D4AF37]/30 text-gray-300 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  }`}
                >
                  <Heart size={24} fill={isInWishlist ? "currentColor" : "none"} />
                </motion.button>

                <div className="flex items-center gap-6 px-5 py-3 border border-[#D4AF37]/30 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock === 0 || quantity <= 1}
                    className={`text-[#D4AF37] text-xl font-medium hover:text-[#F5F0E6] transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    −
                  </button>
                  <span className="text-lg font-bold min-w-[20px] text-center text-[#F5F0E6]">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock || 10, quantity + 1))
                    }
                    disabled={product.stock === 0 || quantity >= (product.stock || 0)}
                    className={`text-[#D4AF37] text-xl font-medium hover:text-[#F5F0E6] transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-4">
                <motion.button
                  whileHover={product.stock === 0 ? {} : { scale: 1.02 }}
                  whileTap={product.stock === 0 ? {} : { scale: 0.98 }}
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                  className={`w-full md:flex-1 py-4 font-semibold text-lg rounded-xl transition-colors shadow-none ${
                    product.stock === 0
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600/40"
                      : "bg-[#D4AF37] text-[#07271F] hover:bg-[#E6C78B] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                  }`}
                >
                  {product.stock === 0 ? "Unavailable" : "Add to Cart"}
                </motion.button>

                <motion.button
                  whileHover={product.stock === 0 ? {} : { scale: 1.02 }}
                  whileTap={product.stock === 0 ? {} : { scale: 0.98 }}
                  disabled={product.stock === 0}
                  onClick={() => {
                    if (!token) {
                      toast.error("Please sign in to buy items");
                      router.push("/login");
                      return;
                    }
                    if (!product) return;
                    if (product.stock === 0) {
                      toast.error("please check our website after few time till then pls stay connect to us");
                      return;
                    }
                    addToCart(product, quantity);
                    router.push("/checkout");
                  }}
                  className={`w-full md:flex-1 py-4 font-semibold text-lg rounded-xl transition-colors shadow-none ${
                    product.stock === 0
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600/40"
                      : "bg-[#D4AF37] text-[#07271F] hover:bg-[#E6C78B] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                  }`}
                >
                  {product.stock === 0 ? "Out of Stock" : "Buy Now"}
                </motion.button>
              </div>
            </div>

            {/* Stock Info */}
            {product.stock === 0 ? (
              <div className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-200">
                <p className="font-semibold text-base mb-1">Currently Out of Stock</p>
                <p className="text-sm font-light text-gray-300">
                  please check our website after few time till then pls stay connect to us
                </p>
              </div>
            ) : (
              <p className="text-gray-400">
                <span className="text-green-400 font-semibold">In Stock</span> (
                {product.stock} available)
              </p>
            )}
          </motion.div>
        </div>

        {/* Details Sections */}
        <div className="space-y-4">
          {[
            {
              id: "description",
              title: "Description",
              content: product.description,
            },
            {
              id: "specifications",
              title: "Specifications",
              content:
                "Premium craftsmanship • Hand-made • Eco-friendly materials",
            },
            {
              id: "shipping",
              title: "Shipping & Returns",
              content: (
                <>
                  Free shipping nationwide • At Pavira Signature we have very customer friendly return/refund/replacement policies. You can find detailed policies <Link href="/refund-policy" className="text-[#D4AF37] underline hover:text-[#E6C78B]">here</Link>. • Secure packaging
                </>
              ),
            },
          ].map((section) => (
            <motion.div
              key={section.id}
              className="border border-secondary-foreground/20 rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedSection(
                    expandedSection === section.id ? null : section.id,
                  )
                }
                className="w-full px-6 py-4 flex justify-between items-center bg-secondary/40 hover:bg-secondary/60 transition"
              >
                <span className="font-semibold">{section.title}</span>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${
                    expandedSection === section.id ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSection === section.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-6 py-4 border-t border-secondary-foreground/20 text-gray-300"
                >
                  {section.content}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

    </main>
    </PublicLayout>
  );
}
