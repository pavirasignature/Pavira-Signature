"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Star, ShoppingCart, Minus, Plus, Truck, Shield, Award, ArrowRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getAbsoluteUrl, isExternalUrl } from "@/lib/config";

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
  const productId = product._id || product.id || "";
  const productImg = getProductImage(product);
  const isOutOfStock = product?.stock === 0;
  const categoryName =
    typeof product.category === "object" && product.category
      ? product.category.name
      : product.category || "Décor";

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
      style: { background: "#0C3A2E", color: "#F9F6F0", border: "1px solid #2A7D6B" },
      iconTheme: { primary: "#2A7D6B", secondary: "#F9F6F0" },
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white text-[#1A1A1A] border border-border transition-colors"
          aria-label="Close quick view"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left — Image */}
          <div className="relative aspect-square bg-[#F2EFE9]">
            <Image
              src={productImg}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
            {isOutOfStock && (
              <div className="absolute top-4 left-4">
                <span className="bg-[#A85751] text-white px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Right — Details */}
          <div className="p-8 md:p-10 flex flex-col justify-between">
            <div>
              {/* Category */}
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] font-medium mb-2">
                {categoryName}
              </p>

              {/* Product Name */}
              <h2 className="text-2xl md:text-3xl font-serif text-[#1A1A1A] leading-snug mb-3">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.round(product.rating)
                          ? "fill-[#D4AF37] text-[#D4AF37]"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {product.rating?.toFixed(1)} ({product.numReviews || 24} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-border/60">
                <span className="text-2xl font-sans font-semibold text-[#1A1A1A]">
                  ₹{product.price?.toLocaleString("en-IN")}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through ml-3">
                    ₹{product.compareAtPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-muted-foreground font-light leading-relaxed mb-6 line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-2">
                  Quantity
                </p>
                <div className="inline-flex items-center border border-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-[#F2EFE9] transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-5 py-2 text-sm font-medium text-[#1A1A1A] min-w-[48px] text-center border-x border-border">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-[#F2EFE9] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Delivery Estimate */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 pb-6 border-b border-border/60">
                <Truck size={14} className="text-[#0C3A2E]" />
                <span>Delivered in 7–10 business days</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full py-3.5 text-xs font-semibold uppercase tracking-widest bg-[#A85751]/10 text-[#A85751] border border-[#A85751]/30 cursor-not-allowed text-center"
                >
                  Out of Stock
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-[#0C3A2E] text-white py-3.5 text-xs font-semibold uppercase tracking-widest hover:bg-[#0C3A2E]/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={15} />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full border border-[#0C3A2E] text-[#0C3A2E] py-3.5 text-xs font-semibold uppercase tracking-widest hover:bg-[#0C3A2E] hover:text-white transition-colors"
                  >
                    Buy Now
                  </button>
                </>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 mt-2 border-t border-border/60">
                <div className="flex flex-col items-center text-center gap-1">
                  <Shield size={16} className="text-[#0C3A2E]" />
                  <span className="text-[9px] text-muted-foreground leading-tight">
                    Secure Packaging
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <Award size={16} className="text-[#0C3A2E]" />
                  <span className="text-[9px] text-muted-foreground leading-tight">
                    Premium Craft
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <Truck size={16} className="text-[#0C3A2E]" />
                  <span className="text-[9px] text-muted-foreground leading-tight">
                    Easy Assistance
                  </span>
                </div>
              </div>

              {/* View Full Details */}
              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 text-xs text-[#0C3A2E] hover:text-[#D4AF37] transition-colors pt-2 font-medium"
              >
                <span>View Full Details</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
