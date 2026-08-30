"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useStore } from "@/store/useStore";
import toast from "react-hot-toast";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { config, getAbsoluteUrl, isExternalUrl } from "@/lib/config";
interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  images?: { url: string }[];
  rating: number;
  numReviews?: number;
  slug: string;
  category?: any;
}

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}


const getProductImage = (product: Product) => {
  const isValidRemoteUrl = (url: string) => {
    if (!url) return false;
    if (url.includes("file://") || url.includes("D:") || url.includes("Downloads")) return false;
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
      const url = typeof img === "string" ? img : (img && typeof img === "object" ? (img as any).url : "");
      if (url && isValidRemoteUrl(url)) return withCacheBust(getAbsoluteUrl(url));
    }
  }

  if (product.image && isValidRemoteUrl(product.image)) {
    return withCacheBust(getAbsoluteUrl(product.image));
  }

  const name = product.name.toLowerCase();
  if (name.includes("lotus") || name.includes("wall art")) return "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80";
  if (name.includes("clock")) return "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=400&q=80";
  if (name.includes("mandala")) return "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=400&q=80";
  if (name.includes("candle") || name.includes("scented")) return "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80";
  if (name.includes("panels") || name.includes("mdf")) return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80";
  if (name.includes("grill") || name.includes("door")) return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80";

  return config.images.productPlaceholder;
};

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart, addToWishlist, wishlist, token } = useStore();
  const router = useRouter();
  const productId = product._id || product.id || "";
  const productImg = getProductImage(product);
  const isOutOfStock = (product as any)?.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please sign in to add items to your cart");
      router.push("/login");
      return;
    }
    if (isOutOfStock) {
      toast.error("This item is currently out of stock", {
        style: { background: "#1A1A1A", color: "#F9F6F0", border: "1px solid #A85751" },
        iconTheme: { primary: "#A85751", secondary: "#F9F6F0" }
      });
      return;
    }
    addToCart({ product: productId, quantity: 1, price: product.price, name: product.name, image: productImg });
    toast.success("Added to cart", {
      style: { background: "#0C3A2E", color: "#F9F6F0", border: "1px solid #2A7D6B" },
      iconTheme: { primary: "#2A7D6B", secondary: "#F9F6F0" }
    });
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please sign in to add items to your wishlist");
      router.push("/login");
      return;
    }
    if (wishlist.includes(productId)) {
      toast.error("Already in wishlist");
      return;
    }
    addToWishlist(productId);
    toast.success("Added to wishlist", {
      style: { background: "#0C3A2E", color: "#F9F6F0", border: "1px solid #D4AF37" },
      iconTheme: { primary: "#D4AF37", secondary: "#0C3A2E" }
    });
  };

  const [isImageLoaded, setIsImageLoaded] = React.useState(false);
  const categoryName = typeof product.category === "object" && product.category ? product.category.name : product.category || "Decor";

  return (
    <div className="group relative bg-white border border-border/80 hover:border-foreground/30 transition-all duration-300 flex flex-col h-full">
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F2EFE9]">
        <Link href={`/products/${product.slug}`} className="block relative w-full h-full">
          <Image
            src={productImg}
            alt={`${product.name} - Pavira Signature Decor`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            className={`object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-out ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsImageLoaded(true)}
          />
        </Link>

        {/* Top Left Badges: Out of Stock */}
        {isOutOfStock && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <span className="bg-[#A85751] text-white px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase">
              Out of Stock
            </span>
          </div>
        )}

        {/* Top Right Wishlist Button */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={handleAddToWishlist}
            title="Save to Wishlist"
            className="bg-white/90 backdrop-blur-sm hover:bg-white text-[#1A1A1A] p-2 transition-colors border border-border shadow-sm"
          >
            <Heart size={16} className={wishlist.includes(productId) ? "fill-[#A85751] stroke-[#A85751]" : "stroke-current"} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1 justify-between bg-white">
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">
            {categoryName}
          </p>

          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-base font-serif text-[#1A1A1A] group-hover:text-[#0C3A2E] transition-colors duration-200 line-clamp-2 min-h-[2.75rem] font-normal leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Star Rating */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-0.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < Math.round(product.rating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground ml-1">
              ({product.numReviews || 24})
            </span>
          </div>

          {/* Price */}
          <div className="pt-1">
            <span className="text-lg font-sans font-semibold text-[#1A1A1A] tracking-tight">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 mt-auto">
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-widest bg-[#A85751]/10 text-[#A85751] border border-[#A85751]/30 cursor-not-allowed text-center"
            >
              Out of Stock
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#0C3A2E] text-white hover:bg-[#0C3A2E]/90 py-2.5 px-4 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={14} />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="bg-white border border-border/80 overflow-hidden relative w-full flex flex-col h-full animate-pulse">
      <div className="aspect-[4/5] bg-[#F2EFE9] w-full" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-1/3 bg-muted rounded-none" />
        <div className="h-4 w-3/4 bg-muted rounded-none" />
        <div className="h-3 w-1/4 bg-muted rounded-none" />
        <div className="pt-4 mt-auto">
          <div className="h-9 w-full bg-muted rounded-none" />
        </div>
      </div>
    </div>
  );
}
