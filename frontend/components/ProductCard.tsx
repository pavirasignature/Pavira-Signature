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
  const discount = product.compareAtPrice ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please sign in to add items to your cart");
      router.push("/login");
      return;
    }
    addToCart({ product: productId, quantity: 1, price: product.price, name: product.name, image: productImg });
    toast.success("Added to cart");
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
    toast.success("Added to wishlist");
  };

  const [isHoverEnabled, setIsHoverEnabled] = React.useState(false);
  const [isImageLoaded, setIsImageLoaded] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsHoverEnabled(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    }
  }, []);

  const categoryName = typeof product.category === "object" && product.category ? product.category.name : product.category || "Decor";

  // Magnetic Tilt Physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHoverEnabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    if (!isHoverEnabled) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={isHoverEnabled ? { rotateX, rotateY, transformStyle: "preserve-3d" } : {}}
      className="group relative bg-[#112F24]/75 backdrop-blur-xl rounded-2xl overflow-hidden border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_12px_35px_rgba(212,175,55,0.18)] flex flex-col h-full"
    >
      <Link href={`/products/${product.slug}`} className="flex flex-col h-full w-full">
        {/* Image Container */}
        <div 
          className="relative aspect-[4/5] sm:aspect-square overflow-hidden bg-[#07241D] rounded-t-2xl" 
          style={isHoverEnabled ? { transform: "translateZ(25px)" } : {}}
        >
          <Image
            src={productImg}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className={`object-cover scale-100 group-hover:scale-105 transition-all duration-500 ease-out ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsImageLoaded(true)}
            style={{ transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)" }}
          />

          {/* Top Left Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
            {discount > 0 && (
              <span className="bg-gradient-to-r from-[#D4AF37] to-[#B89228] text-[#0B3B2E] px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-md border border-[#F5F0E6]/20">
                {discount}% OFF
              </span>
            )}
            {(product as any)?.stock === 0 && (
              <span className="bg-[#0B3B2E]/90 text-red-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md border border-red-500/30">
                Out of Stock
              </span>
            )}
          </div>

          {/* Top Right Floating Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20">
            <button
              onClick={handleAddToWishlist}
              title="Add to Wishlist"
              className="bg-[#0B3B2E]/85 backdrop-blur-md hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0B3B2E] p-2.5 rounded-full transition-all duration-200 shadow-lg border border-[#D4AF37]/30 hover:scale-110 active:scale-95"
            >
              <Heart size={15} className={wishlist.includes(productId) ? "fill-red-500 stroke-red-500" : ""} />
            </button>
          </div>

          {/* Bottom Hover Action Bar */}
          <div className="absolute bottom-3 left-3 right-3 z-20 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out hidden sm:block">
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#0B3B2E]/90 backdrop-blur-md hover:bg-[#D4AF37] text-[#F5F0E6] hover:text-[#0B3B2E] py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 border border-[#D4AF37]/40 flex items-center justify-center gap-2 shadow-xl hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            >
              <ShoppingCart size={14} />
              <span>Quick Add</span>
            </button>
          </div>
          
          {/* Subtle Hover Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B3B2E]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />
        </div>

        {/* Content Details */}
        <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow relative z-30 bg-gradient-to-b from-[#112F24]/90 to-[#112F24]" style={isHoverEnabled ? { transform: "translateZ(30px)" } : {}}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-[0.2em] opacity-90 truncate">
                {categoryName}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <Star size={11} className="fill-[#D4AF37] text-[#D4AF37]" />
                <span className="text-[11px] font-bold text-[#F5F0E6]">{product.rating.toFixed(1)}</span>
              </div>
            </div>

            <h3 className="text-sm sm:text-base font-serif text-[#F5F0E6] group-hover:text-[#D4AF37] transition-colors duration-300 line-clamp-1 font-medium mb-3">
              {product.name}
            </h3>
          </div>

          {/* Pricing & CTA Footer */}
          <div className="pt-3 border-t border-[#D4AF37]/15 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-extrabold text-[#F5F0E6] tracking-tight">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-gray-400 line-through decoration-[#D4AF37]/50 font-normal">
                  ₹{product.compareAtPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Mobile Touch Quick Add Button */}
            <button
              onClick={handleAddToCart}
              className="sm:hidden bg-[#0B3B2E] text-[#D4AF37] p-2 rounded-lg border border-[#D4AF37]/30 active:scale-95 transition-transform"
              title="Add to Cart"
            >
              <ShoppingCart size={15} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="bg-[#112F24]/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-[#D4AF37]/10 shadow-xl relative w-full aspect-[3/4]">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      <div className="aspect-square bg-[#0B3B2E]/50 relative overflow-hidden" />
      <div className="p-6 space-y-4">
        <div className="h-2 w-1/4 bg-[#D4AF37]/20 rounded" />
        <div className="h-6 w-3/4 bg-[#F5F0E6]/20 rounded" />
        <div className="pt-4 border-t border-[#D4AF37]/10 flex justify-between items-center mt-4">
          <div className="h-5 w-20 bg-[#F5F0E6]/20 rounded" />
        </div>
      </div>
    </div>
  );
}
