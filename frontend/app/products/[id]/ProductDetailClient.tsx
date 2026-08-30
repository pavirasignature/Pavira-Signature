"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { wishlistAPI } from "@/lib/api";
import { Heart, Star, Info, ShieldCheck, Truck, ArrowRight, CheckCircle2 } from "lucide-react";
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
  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    wishlist,
    isInWishlist: checkStoreWishlist,
    token,
  } = useStore();
  const router = useRouter();

  const isOutOfStock = product.stock === 0;
  const [quantity, setQuantity] = useState(isOutOfStock ? 0 : 1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (product && checkStoreWishlist) {
      setIsInWishlist(checkStoreWishlist(product._id || product.id || ""));
    }
  }, [product, wishlist, checkStoreWishlist]);

  const handleWishlist = async () => {
    if (!token) {
      toast.error("Please sign in to save items to your wishlist");
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
        toast.success("Added to wishlist", {
          style: { background: "#0C3A2E", color: "#F9F6F0", border: "1px solid #D4AF37" },
          iconTheme: { primary: "#D4AF37", secondary: "#0C3A2E" }
        });
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
    if (isOutOfStock) {
      toast.error("This piece is currently out of stock", {
        style: { background: "#1A1A1A", color: "#F9F6F0", border: "1px solid #A85751" },
        iconTheme: { primary: "#A85751", secondary: "#F9F6F0" }
      });
      return;
    }
    addToCart(product, quantity);
    toast.success("Added to cart", {
      style: { background: "#0C3A2E", color: "#F9F6F0", border: "1px solid #2A7D6B" },
      iconTheme: { primary: "#2A7D6B", secondary: "#F9F6F0" }
    });
  };

  const getProductImage = (prod: Product) => {
    const isValidRemoteUrl = (url: string) => {
      if (!url) return false;
      if (url.includes("file://") || url.includes("D:") || url.includes("Downloads")) return false;
      return isExternalUrl(url) || url.startsWith("/") || url.startsWith("uploads/");
    };

    if (prod.images && prod.images.length > 0) {
      for (const img of prod.images) {
        if (isValidRemoteUrl(img.url)) return getAbsoluteUrl(img.url);
      }
    }

    if (prod.image && isValidRemoteUrl(prod.image)) {
      return getAbsoluteUrl(prod.image);
    }
    return "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1000&q=80";
  };

  const mainImage = getProductImage(product);

  // Exact 7-Image Structure required for luxury e-commerce storytelling
  const galleryImages = [
    {
      url: mainImage,
      label: "Image 1: Room Lifestyle",
      desc: "Beautiful room lifestyle shot showing scale and ambiance",
    },
    {
      url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
      label: "Image 2: Straight Product Shot",
      desc: "Straight, distortion-free view showing true proportions",
    },
    {
      url: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1000&q=80",
      label: "Image 3: Material & Finish",
      desc: "Macro close-up of texture, beveling and hand-finished edges",
    },
    {
      url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1000&q=80",
      label: "Image 4: Side Profile",
      desc: "Side profile detailing 18mm – 25mm structural relief depth",
    },
    {
      url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80",
      label: "Image 5: Wall Reference",
      desc: "Size reference on an 8–12 ft living room wall",
    },
    {
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
      label: "Image 6: Packaging",
      desc: "Shockproof wooden crate packaging engineered for transit",
    },
    {
      url: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1000&q=80",
      label: "Image 7: Installation",
      desc: "Concealed dual bracket mounting on solid or drywall",
    },
  ];

  // 10 Key Structured Specifications
  const productDetails = [
    { label: "Material", value: "High-density composite & structural aerospace-grade aluminum" },
    { label: "Finish", value: "Multi-stage anti-corrosion primer with hand-rubbed matte textures" },
    { label: "Dimensions", value: "120 × 80 cm (Custom sizing available on request)" },
    { label: "Thickness", value: "18mm – 25mm architectural depth" },
    { label: "Weight", value: "4.8 kg (Substantial, rigid construction)" },
    { label: "Colour", value: "Deep forest green, brushed gold & natural charcoal tones" },
    { label: "Mounting", value: "Concealed heavy-duty bracket system (Hardware included)" },
    { label: "What's included", value: "Artwork, precision mounting kit, spirit level, installation template" },
    { label: "Production time", value: "5–7 business days crafted in our Ahmedabad workshop" },
    { label: "Care instructions", value: "Wipe with dry microfiber cloth; avoid solvent cleaners" },
  ];

  return (
    <div className="bg-background text-foreground pt-28 pb-24">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* BREADCRUMBS */}
        <nav className="text-xs uppercase tracking-widest text-muted-foreground mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground transition-colors">
            Collections
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* HERO PRODUCT GRID */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 mb-24 items-start">
          {/* LEFT: 7-IMAGE GALLERY */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Active Display */}
            <div className="aspect-[4/3] sm:aspect-[16/11] relative w-full overflow-hidden bg-[#F2EFE9] border border-border">
              <Image
                src={galleryImages[activeImageIndex].url}
                alt={`${product.name} - ${galleryImages[activeImageIndex].label}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center transition-all duration-500"
              />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#1A1A1A] font-semibold border border-border">
                {galleryImages[activeImageIndex].label}
              </div>
            </div>

            {/* Thumbnail Strip (7 items) */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square relative overflow-hidden bg-[#F2EFE9] border transition-all ${
                    activeImageIndex === idx
                      ? "border-[#0C3A2E] ring-2 ring-[#0C3A2E]/20"
                      : "border-border hover:border-foreground/40 opacity-75 hover:opacity-100"
                  }`}
                  title={img.label}
                >
                  <Image
                    src={img.url}
                    alt={img.label}
                    fill
                    sizes="100px"
                    className="object-cover object-center"
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground font-light mt-1 italic">
              {galleryImages[activeImageIndex].desc}
            </p>
          </div>

          {/* RIGHT: BUYING PANEL (STICKY) */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-28 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-2">
                  {typeof product.category === "object" && product.category
                    ? product.category.name
                    : product.category || "Wall Décor"}
                </p>
                <h1 className="text-3xl sm:text-4xl font-brand text-[#1A1A1A] leading-tight mb-3">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-3">
                  <div className="flex text-[#D4AF37]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.round(product.rating || 5) ? "fill-[#D4AF37]" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({product.reviews?.length || 28} verified reviews)
                  </span>
                </div>
              </div>

              {/* Price & Inclusions */}
              <div className="border-y border-border/80 py-5 space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-sans font-bold text-[#1A1A1A] tracking-tight">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-[#2A7D6B] font-semibold">
                    In Stock · Ready to Dispatch
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-light">
                  All taxes included. Free insured crated delivery nationwide.
                </p>
              </div>

              {/* Description */}
              <p className="text-sm font-light text-[#1A1A1A]/85 leading-relaxed">
                {product.description ||
                  "Original geometric artwork engineered with layered depth, anti-corrosive powder finishes, and architectural proportions. Designed to serve as a calming, sophisticated focal point in contemporary Indian interiors."}
              </p>

              {/* Size Quick Summary */}
              <div className="p-4 bg-[#F2EFE9] border border-border text-xs space-y-1">
                <div className="flex justify-between font-medium text-[#1A1A1A]">
                  <span>Standard Dimension:</span>
                  <span>120 × 80 cm (47 × 31.5 in)</span>
                </div>
                <div className="flex justify-between text-muted-foreground font-light">
                  <span>Recommended Wall:</span>
                  <span>8–12 ft wide living/dining wall</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-border bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="px-3.5 py-3 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="text-xs font-bold w-7 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                      disabled={quantity >= (product.stock || 10) || isOutOfStock}
                      className="px-3.5 py-3 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 bg-[#0C3A2E] text-white hover:bg-[#0C3A2E]/90 py-3.5 px-6 text-xs uppercase tracking-[0.2em] font-semibold transition-colors disabled:bg-[#A85751] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={handleWishlist}
                    title="Save to Wishlist"
                    className={`px-4 border transition-colors flex items-center justify-center ${
                      isInWishlist
                        ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                        : "border-border text-foreground hover:border-foreground"
                    }`}
                  >
                    <Heart size={18} className={isInWishlist ? "fill-current" : ""} />
                  </button>
                </div>

                {/* Direct Checkout Button */}
                <button
                  onClick={() => {
                    handleAddToCart();
                    if (!isOutOfStock) router.push("/checkout");
                  }}
                  disabled={isOutOfStock}
                  className="w-full py-3.5 border border-[#0C3A2E] text-[#0C3A2E] hover:bg-[#0C3A2E] hover:text-white text-xs uppercase tracking-[0.2em] font-semibold transition-colors disabled:opacity-40"
                >
                  {isOutOfStock ? "Unavailable" : "Buy It Now"}
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/80 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-[#0C3A2E]" />
                  <span>Insured Crated Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#0C3A2E]" />
                  <span>Quality Assured in Ahmedabad</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 10-POINT SPECIFICATIONS SECTION */}
        <div className="pt-16 pb-20 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-2">
                Technical Specifications
              </p>
              <h2 className="text-2xl md:text-3xl font-brand text-[#1A1A1A]">
                Product Details
              </h2>
            </div>

            <div className="bg-white border border-border/90 divide-y divide-border/60">
              {productDetails.map((detail, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 p-4 text-sm hover:bg-[#FDFBF7] transition-colors"
                >
                  <span className="sm:col-span-4 font-semibold text-[#1A1A1A]">
                    {detail.label}
                  </span>
                  <span className="sm:col-span-8 text-muted-foreground font-light mt-1 sm:mt-0">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIZE VISUALIZATION GUIDE (WHAT SIZE SHOULD I BUY?) */}
        <div className="pt-16 border-t border-border">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-2">
              Wall Proportion Guide
            </p>
            <h2 className="text-2xl md:text-4xl font-brand text-[#1A1A1A] mb-4">
              What Size Should I Buy?
            </h2>
            <p className="text-sm text-muted-foreground font-light">
              Selecting the right proportions ensures your wall art feels like an
              architectural fixture rather than an afterthought.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              {
                size: "Small",
                dims: "60 × 40 cm (24 × 16 in)",
                wall: "4–6 ft wide",
                ideal: "Entryways, powder rooms, or accent pillars",
              },
              {
                size: "Medium",
                dims: "90 × 60 cm (36 × 24 in)",
                wall: "6–8 ft wide",
                ideal: "Study tables, bedroom consoles, or reading corners",
              },
              {
                size: "Large",
                dims: "120 × 80 cm (48 × 32 in)",
                wall: "8–10 ft wide",
                ideal: "Standard 3-seater living sofa walls & dining rooms",
              },
              {
                size: "Statement",
                dims: "150 × 100 cm (60 × 40 in)",
                wall: "10–14 ft wide",
                ideal: "Double-height foyers, grand living rooms & master suites",
              },
            ].map((sz, i) => (
              <div
                key={i}
                className="bg-white p-8 border border-border hover:border-foreground/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] bg-[#F2EFE9] border border-border/60 mb-6 flex items-center justify-center p-4">
                    <div
                      className={`bg-[#0C3A2E] text-white flex items-center justify-center text-[10px] uppercase font-bold tracking-wider ${
                        i === 0
                          ? "w-16 h-10"
                          : i === 1
                          ? "w-24 h-14"
                          : i === 2
                          ? "w-32 h-20"
                          : "w-40 h-24"
                      }`}
                    >
                      {sz.size}
                    </div>
                  </div>
                  <h4 className="font-semibold text-lg text-[#1A1A1A] mb-1">
                    {sz.size}
                  </h4>
                  <p className="text-sm font-medium text-[#0C3A2E] mb-2">
                    {sz.dims}
                  </p>
                  <p className="text-xs text-[#1A1A1A] font-light mb-3">
                    Recommended wall: <strong>{sz.wall}</strong>
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground border-t border-border/60 pt-3">
                  {sz.ideal}
                </p>
              </div>
            ))}
          </div>

          {/* Trade / Custom Dimensions Banner */}
          <div className="mt-16 bg-[#F2EFE9] border border-border p-8 text-center max-w-3xl mx-auto">
            <h3 className="text-xl font-brand text-[#1A1A1A] mb-2">
              Have Specific Wall Dimensions or Commercial Niches?
            </h3>
            <p className="text-xs text-muted-foreground font-light mb-5 max-w-xl mx-auto">
              We fabricate bespoke dimensions up to 240 cm single panel or
              multi-panel gallery triptychs with project pricing for architects
              and designers.
            </p>
            <Link
              href="/professionals"
              className="inline-flex items-center gap-2 bg-[#0C3A2E] text-white hover:bg-[#0C3A2E]/90 px-6 py-2.5 text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              <span>Consult Trade Team</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
