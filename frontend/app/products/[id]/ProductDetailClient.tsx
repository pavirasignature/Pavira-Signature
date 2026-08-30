"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { wishlistAPI } from "@/lib/api";
import { Heart, Star, Info } from "lucide-react";
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
      toast.error("Product currently unavailable.");
      return;
    }
    addToCart(product, quantity);
    toast.success("Added to cart");
  };

  const getProductImage = (product: Product) => {
    const isValidRemoteUrl = (url: string) => {
      if (!url) return false;
      if (url.includes("file://") || url.includes("D:") || url.includes("Downloads")) return false;
      return isExternalUrl(url) || url.startsWith("/") || url.startsWith("uploads/");
    };

    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (isValidRemoteUrl(img.url)) return getAbsoluteUrl(img.url);
      }
    }

    if (product.image && isValidRemoteUrl(product.image)) {
      return getAbsoluteUrl(product.image);
    }
    return "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80";
  };

  const mainImage = getProductImage(product);
  
  // Generating placeholder images for the 7-image gallery requirement to showcase layout
  const galleryImages = [
    { url: mainImage, alt: "Beautiful room lifestyle shot." },
    { url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80", alt: "Straight product shot." },
    { url: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80", alt: "Close-up of material/finish." },
    { url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80", alt: "Side profile showing thickness." },
    { url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80", alt: "Size reference on a wall." },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", alt: "Packaging." },
    { url: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80", alt: "Installation." },
  ];

  const productDetails = [
    { label: "Material", value: "Premium engineered wood/metal" },
    { label: "Finish", value: "Hand-applied multi-layer coating" },
    { label: "Dimensions", value: "Multiple sizes available" },
    { label: "Thickness", value: "18mm - 25mm profile" },
    { label: "Weight", value: "3.5 kg (Standard size)" },
    { label: "Colour", value: "As shown (Customizable)" },
    { label: "Mounting", value: "Concealed heavy-duty bracket" },
    { label: "What's included", value: "Artwork, mounting hardware, certificate" },
    { label: "Production time", value: "7-10 business days" },
    { label: "Care instructions", value: "Wipe with dry microfiber cloth" },
  ];

  return (
    <div className="bg-background text-foreground pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-16 mb-32">
          
          {/* IMAGE GALLERY (7 Shots) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Image 1: Beautiful room lifestyle shot */}
            <div className="aspect-[4/5] relative bg-muted overflow-hidden">
              <Image src={galleryImages[0].url} alt={galleryImages[0].alt} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 60vw" />
            </div>
            
            {/* Images 2-7: Grid */}
            <div className="grid grid-cols-2 gap-4">
              {galleryImages.slice(1).map((img, i) => (
                <div key={i} className="aspect-square relative bg-muted overflow-hidden">
                  <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 30vw" />
                  <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 text-[10px] uppercase tracking-widest text-foreground font-semibold">
                    {img.alt.split('.')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCT DETAILS (Sticky Right Panel) */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-32">
              <p className="text-muted-foreground uppercase tracking-widest text-xs font-semibold mb-3">
                {typeof product.category === 'object' && product.category ? (product.category as any).name : product.category || "Decor"}
              </p>
              <h1 className="text-3xl md:text-4xl font-brand mb-4 leading-tight text-foreground">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-8">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.round(product.rating) ? "fill-accent text-accent" : "text-border"} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.reviews?.length || 12} Reviews
                </span>
              </div>

              <div className="mb-8">
                <p className="text-3xl font-light text-foreground mb-2">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground tracking-wide uppercase">
                  Taxes included. Free shipping nationwide.
                </p>
              </div>

              <p className="text-sm font-light text-foreground/80 leading-relaxed mb-10">
                {product.description}
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-4 mb-12">
                <div className="flex gap-4">
                  <div className="flex items-center gap-4 px-4 py-3 border border-border">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      −
                    </button>
                    <span className="text-sm font-semibold w-4 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))} disabled={quantity >= (product.stock || 0)} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      +
                    </button>
                  </div>
                  
                  <button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 bg-foreground text-background text-sm uppercase tracking-widest font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50">
                    {product.stock === 0 ? "Unavailable" : "Add to Cart"}
                  </button>
                  
                  <button onClick={handleWishlist} className={`px-4 border transition-colors flex items-center justify-center ${isInWishlist ? "bg-accent/10 border-accent text-accent" : "border-border text-foreground hover:border-foreground"}`}>
                    <Heart size={20} fill={isInWishlist ? "currentColor" : "none"} />
                  </button>
                </div>
                
                <button onClick={() => { handleAddToCart(); if(product.stock !== 0) router.push("/checkout"); }} disabled={product.stock === 0} className="w-full py-4 border border-foreground text-foreground text-sm uppercase tracking-widest font-semibold hover:bg-foreground hover:text-background transition-colors disabled:opacity-50">
                  {product.stock === 0 ? "Out of Stock" : "Buy It Now"}
                </button>
              </div>

              {/* Strict Product Details List */}
              <div className="border-t border-border pt-8">
                <h3 className="text-sm uppercase tracking-widest font-semibold mb-6">Product Details</h3>
                <ul className="space-y-3">
                  {productDetails.map((detail, idx) => (
                    <li key={idx} className="flex flex-col sm:flex-row sm:justify-between text-sm py-2 border-b border-border/40 last:border-0">
                      <span className="text-muted-foreground font-light">{detail.label}</span>
                      <span className="font-medium text-right mt-1 sm:mt-0">{detail.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* SIZE VISUALIZATION BLOCK */}
        <div className="pt-24 border-t border-border">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-brand mb-4">What Size Should I Buy?</h2>
            <p className="text-muted-foreground font-light">Visualizing our artwork proportions for your space.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { size: "Small", dims: "60 × 40 cm", wall: "4-6 ft wide" },
              { size: "Medium", dims: "90 × 60 cm", wall: "6-8 ft wide" },
              { size: "Large", dims: "120 × 80 cm", wall: "8-10 ft wide" },
              { size: "Statement", dims: "150 × 100 cm", wall: "10-14 ft wide" }
            ].map((sz, i) => (
              <div key={i} className="bg-muted p-8 flex flex-col items-center justify-center border border-transparent hover:border-border transition-colors">
                <div className={`w-full bg-border mb-6 flex items-center justify-center text-xs text-muted-foreground ${i===0 ? 'aspect-[3/4] max-w-[80px]' : i===1 ? 'aspect-square max-w-[100px]' : i===2 ? 'aspect-[4/3] max-w-[120px]' : 'aspect-[16/9] max-w-[160px]'}`}>
                  Artwork
                </div>
                <h4 className="font-semibold text-lg mb-1">{sz.size}</h4>
                <p className="text-sm text-foreground mb-2">{sz.dims}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Info size={12} /> Recommended wall: {sz.wall}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
