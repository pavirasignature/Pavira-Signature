"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { wishlistAPI } from "@/lib/api";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Header from "@/components/navigation/Header";
import { useStore } from "@/store/useStore";

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  rating?: number;
  category?: string;
}

interface WishlistItem {
  product: Product;
  addedAt?: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const { addToCart, token } = useStore();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.getAll();
      if (response.data.success) {
        setWishlistItems(response.data.data?.products || []);
      }
    } catch (error: any) {
      console.error("Error fetching wishlist:", error);
      if (error.response?.status === 401) {
        showToast("Please login to view your wishlist", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      const response = await wishlistAPI.remove(productId);
      if (response.data.success) {
        setWishlistItems(response.data.data?.products || []);
        showToast("Removed from wishlist", "success");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      showToast("Failed to remove from wishlist", "error");
    }
  };

  const handleClearWishlist = async () => {
    if (!confirm("Clear all items from wishlist?")) return;

    try {
      await wishlistAPI.clear();
      setWishlistItems([]);
      showToast("Wishlist cleared", "success");
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      showToast("Failed to clear wishlist", "error");
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = (product: Product) => {
    if (!token) {
      showToast("Please sign in to add items to your cart", "error");
      router.push("/login");
      return;
    }
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image || "",
    }, 1);
    showToast("Added to cart", "success");
  };

  const totalPrice = wishlistItems.reduce(
    (sum, item) => sum + (item.product.price || 0),
    0,
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F6F0] text-[#1A1A1A] selection:bg-[#0C3A2E] selection:text-white">
      <Header />

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-none font-semibold shadow-lg text-sm tracking-wide ${
            toast.type === "success"
              ? "bg-[#2A7D6B] text-white"
              : "bg-[#A85751] text-white"
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Header */}
          <motion.div
            className="mb-12 border-b border-[#1A1A1A]/10 pb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-brand mb-3 text-[#1A1A1A]">
              My Wishlist
            </h1>
            <p className="text-[#1A1A1A]/60 font-light text-sm uppercase tracking-[0.2em]">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "Item" : "Items"} saved
            </p>
          </motion.div>
 
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 bg-white border border-[#1A1A1A]/5 animate-pulse"
                />
              ))}
            </div>
          ) : wishlistItems.length === 0 ? (
            <motion.div
              className="text-center py-32 bg-white border border-[#1A1A1A]/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Heart size={48} strokeWidth={1} className="mx-auto mb-6 text-[#1A1A1A]/20" />
              <h2 className="text-2xl font-brand mb-4 text-[#1A1A1A]">Your wishlist is empty</h2>
              <p className="text-[#1A1A1A]/60 mb-10 font-light max-w-md mx-auto">
                Explore our collections and add your favorite pieces to curate your personal gallery.
              </p>
              <button
                onClick={() => router.push("/products")}
                className="bg-[#0C3A2E] text-white px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#0C3A2E]/90 transition-colors"
              >
                Continue Shopping
              </button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
              {wishlistItems.map((item, index) => (
                <motion.div
                  key={item.product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white border border-[#1A1A1A]/10 hover:border-[#0C3A2E] transition-all duration-300 relative flex flex-col"
                >
                  {/* Product Image Placeholder/Icon */}
                  <div className="relative h-72 bg-[#F9F6F0] flex items-center justify-center overflow-hidden border-b border-[#1A1A1A]/5">
                    <div className="text-6xl opacity-20 group-hover:scale-105 transition-transform duration-700">
                      🎨
                    </div>
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-[#0C3A2E]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-end p-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRemove(item.product._id)}
                        className="p-2.5 bg-white text-[#A85751] shadow-sm hover:bg-[#A85751] hover:text-white transition-colors"
                        title="Remove from wishlist"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6 flex flex-col flex-grow">
                    <p className="text-[#1A1A1A]/50 text-xs uppercase tracking-[0.2em] mb-2 line-clamp-1">
                      {typeof item.product.category === 'object' && item.product.category ? (item.product.category as any).name : item.product.category || "Decor"}
                    </p>
                    <h3 className="font-brand text-lg mb-3 line-clamp-2 text-[#1A1A1A] group-hover:text-[#0C3A2E] transition-colors leading-snug">
                      {item.product.name}
                    </h3>
                    
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <p className="text-lg font-semibold text-[#1A1A1A]">
                        ₹{item.product.price?.toLocaleString("en-IN")}
                      </p>
                      {item.product.rating && (
                        <div className="flex items-center gap-1.5 bg-[#F9F6F0] px-2 py-1">
                          <span className="text-[#D4AF37] text-xs">★</span>
                          <span className="text-xs font-semibold text-[#1A1A1A]">{item.product.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Footer */}
                  <button
                    onClick={() => handleAddToCart(item.product)}
                    className="w-full py-4 border-t border-[#1A1A1A]/10 text-xs font-semibold uppercase tracking-[0.2em] text-[#0C3A2E] hover:bg-[#0C3A2E] hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={14} />
                    Add to Cart
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Total Price Card */}
              <div className="bg-white border border-[#1A1A1A]/10 p-8 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/50 mb-3">Total Value</p>
                <p className="text-3xl font-brand text-[#1A1A1A]">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </p>
              </div>
 
              {/* Items Card */}
              <div className="bg-white border border-[#1A1A1A]/10 p-8 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/50 mb-3">Total Items</p>
                <p className="text-3xl font-brand text-[#1A1A1A]">
                  {wishlistItems.length}
                </p>
              </div>
 
              {/* Clear Button */}
              <button
                onClick={handleClearWishlist}
                className="bg-white border border-[#A85751]/30 p-8 text-[#A85751] hover:bg-[#A85751] hover:text-white transition-colors flex flex-col justify-center items-center gap-2 group"
              >
                <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs uppercase tracking-[0.2em] font-semibold">Clear Wishlist</span>
              </button>
            </motion.div>
          </>
        )}
      </div>
      </main>
    </div>
  );
}
