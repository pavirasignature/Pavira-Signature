"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Star, ShoppingCart, Minus, Plus, Truck, Shield, Award, ArrowRight, Heart } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getAbsoluteUrl, isExternalUrl } from "@/lib/config";
import { motion } from "framer-motion";

interface QuickViewModalProps {
  product: any;
  onClose: () => void;
}

const getProductImage = (product: any) => {
  const isValid = (url: string) => {
    if (!url) return false;
    if (url.includes("file://") || url.includes("D:") || url.includes("Downloads")) return false;
    return isExternalUrl(url) || url.startsWith("/") || url.startsWith("uploads/");
  };

  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      const url = typeof img === "string" ? img : img?.url || "";
      if (url && isValid(url)) return getAbsoluteUrl(url);
    }
  }
  if (product.image && isValid(product.image)) return getAbsoluteUrl(product.image);
  return "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80";
};

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart, addToWishlist, wishlist, token } = useStore();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const productId = product._id || product.id || "";
  const productImg = getProductImage(product);
  const isOutOfStock = product?.stock === 0;
  const categoryName =
    typeof product.category === "object" && product.category
      ? product.category.name
      : product.category || "Décor";

  // Check if wishlisted
  useEffect(() => {
    setIsWishlisted(wishlist?.some((item: any) => item._id === productId) || false);
  }, [wishlist, productId]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleAddToCart = () => {
    if (!token) {
      toast.error("Please sign in to add items to your cart");
      router.push("/login");
      return;
    }
    if (isOutOfStock) {
      toast.error("This item is currently out of stock");
      return;
    }
    addToCart({
      product: productId,
      quantity,
      price: product.price,
      name: product.name,
      image: productImg,
    });
    toast.success("Added to cart", {
      style: { background: "#0B3B2E", color: "#F5F0E6", border: "1px solid #D4AF37" },
      iconTheme: { primary: "#D4AF37", secondary: "#0B3B2E" },
    });
    onClose();
  };

  const handleBuyNow = () => {
    if (!token) {
      toast.error("Please sign in to continue");
      router.push("/login");
      return;
    }
    if (isOutOfStock) return;
    addToCart({
      product: productId,
      quantity,
      price: product.price,
      name: product.name,
      image: productImg,
    });
    router.push("/checkout");
    onClose();
  };

  const handleWishlist = () => {
    if (!token) {
      toast.error("Please sign in to add to wishlist");
      router.push("/login");
      return;
    }
    addToWishlist(productId);
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist", {
      style: { background: "#0B3B2E", color: "#F5F0E6", border: "1px solid #D4AF37" },
      iconTheme: { primary: "#D4AF37", secondary: "#0B3B2E" },
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 bg-gradient-to-br from-[#0B3B2E] to-[#07271F] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-3xl border border-[#D4AF37]/20"
      >
        {/* Close */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full transition-all duration-300"
          aria-label="Close quick view"
        >
          <X size={20} strokeWidth={2} />
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left — Image */}
          <div className="relative aspect-square bg-[#112F24]/50 overflow-hidden">
            <Image
              src={productImg}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center hover:scale-110 transition-transform duration-700"
            />
            {isOutOfStock && (
              <div className="absolute top-6 left-6">
                <span className="bg-[#D32F2F] text-[#F5F0E6] px-4 py-2 text-[11px] font-semibold tracking-widest uppercase rounded-full">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Wishlist button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWishlist}
              className="absolute top-6 right-6 p-3 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-full transition-all duration-300"
              aria-label="Add to wishlist"
            >
              <Heart
                size={20}
                className={isWishlisted ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#D4AF37]"}
                strokeWidth={1.5}
              />
            </motion.button>
          </div>

          {/* Right — Details */}
          <div className="p-8 md:p-10 flex flex-col justify-between">
            <div>
              {/* Category */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[11px] text-[#D4AF37]/70 uppercase tracking-[0.25em] font-semibold mb-3"
              >
                {categoryName}
              </motion.p>

              {/* Product Name */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-3xl md:text-4xl font-serif font-bold text-[#F5F0E6] leading-tight mb-4"
              >
                {product.name}
              </motion.h2>

              {/* Rating */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.round(product.rating)
                          ? "fill-[#D4AF37] text-[#D4AF37]"
                          : "text-[#D4AF37]/20"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-[#F5F0E6]/70">
                  {product.rating?.toFixed(1)} ({product.numReviews || 24} reviews)
                </span>
              </motion.div>

              {/* Price */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mb-6 pb-6 border-b border-[#D4AF37]/20"
              >
                <span className="text-3xl font-serif font-bold text-[#D4AF37]">
                  ₹{product.price?.toLocaleString("en-IN")}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-base text-[#F5F0E6]/50 line-through ml-4">
                    ₹{product.compareAtPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </motion.div>

              {/* Description */}
              {product.description && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-base text-[#F5F0E6]/80 font-light leading-relaxed mb-6"
                >
                  {product.description}
                </motion.p>
              )}

              {/* Quantity */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mb-6"
              >
                <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#D4AF37]/70 mb-3">
                  Quantity
                </p>
                <div className="inline-flex items-center border border-[#D4AF37]/30 rounded-lg bg-[#112F24]/40 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-[#D4AF37]/10 transition-colors text-[#D4AF37]"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 py-3 text-base font-semibold text-[#F5F0E6] min-w-[60px] text-center border-x border-[#D4AF37]/20">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-[#D4AF37]/10 transition-colors text-[#D4AF37]"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </motion.div>

              {/* Delivery Estimate */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 text-sm text-[#F5F0E6]/70 mb-6 pb-6 border-b border-[#D4AF37]/20"
              >
                <Truck size={16} className="text-[#D4AF37]" strokeWidth={1.5} />
                <span>Delivered in 7–10 business days</span>
              </motion.div>
            </div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="space-y-3"
            >
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full py-4 text-sm font-semibold uppercase tracking-widest bg-[#D32F2F]/20 text-[#D32F2F] border border-[#D32F2F]/40 cursor-not-allowed text-center rounded-lg"
                >
                  Out of Stock
                </button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#D4AF37]/80 text-[#0B3B2E] py-4 text-sm font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 flex items-center justify-center gap-2 rounded-lg"
                  >
                    <ShoppingCart size={17} strokeWidth={2} />
                    Add to Cart
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyNow}
                    className="w-full border-2 border-[#D4AF37]/50 text-[#D4AF37] py-4 text-sm font-bold uppercase tracking-widest hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300 rounded-lg"
                  >
                    Buy Now
                  </motion.button>
                </>
              )}

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-3 pt-4 mt-4 border-t border-[#D4AF37]/20"
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
                  <span className="text-[10px] text-[#F5F0E6]/60 leading-tight font-medium">
                    Secure Packaging
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Award size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
                  <span className="text-[10px] text-[#F5F0E6]/60 leading-tight font-medium">
                    Premium Craft
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
                  <span className="text-[10px] text-[#F5F0E6]/60 leading-tight font-medium">
                    Easy Assistance
                  </span>
                </div>
              </motion.div>

              {/* View Full Details */}
              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 text-sm text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors pt-4 font-semibold uppercase tracking-wide"
              >
                <span>View Full Details</span>
                <ArrowRight size={15} strokeWidth={2} />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
