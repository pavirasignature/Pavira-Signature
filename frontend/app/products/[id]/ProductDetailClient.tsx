"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { wishlistAPI } from "@/lib/api";
import { Heart, Star, ChevronDown } from "lucide-react";
import { getAbsoluteUrl, isExternalUrl } from "@/lib/config";
import Image from "next/image";
import { useStore } from "@/store/useStore";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  id?: string;
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

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, isInWishlist: checkStoreWishlist, token } = useStore();
  const router = useRouter();

  const initialStock = product.stock === 0 ? 0 : 1;
  const [quantity, setQuantity] = useState(initialStock);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("description");

  useEffect(() => {
    if (product && checkStoreWishlist) {
      setIsInWishlist(checkStoreWishlist(product._id || product.id || ""));
    }
  }, [product, wishlist, checkStoreWishlist]);

  const handleWishlist = async () => {
    if (!token) {
      toast.error("Please sign in to add items to your wishlist");
      router.push("/login");
      return;
    }
    if (!product) return;
    const pid = product._id || product.id;
    if (!pid) return;
    try {
      if (isInWishlist) {
        await wishlistAPI.remove(pid);
        setIsInWishlist(false);
        removeFromWishlist(pid);
        toast.success("Removed from wishlist");
      } else {
        await wishlistAPI.add(pid);
        setIsInWishlist(true);
        addToWishlist(pid);
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

  return (
    <>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 mb-20">
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

            <div className="mb-8 pb-8 border-b border-secondary-foreground/20">
              <p className="text-5xl font-bold text-[#D4AF37] mb-2">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
              <p className="text-gray-400">
                Free shipping on orders above ₹1000
              </p>
            </div>

            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="flex flex-col gap-4 mb-8">
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
    </>
  );
}
