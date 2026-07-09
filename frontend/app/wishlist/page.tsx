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
    <div className="min-h-screen flex flex-col bg-secondary text-foreground">
      <Header />

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg font-semibold ${
            toast.type === "success"
              ? "bg-green-500/20 border border-green-500 text-green-300"
              : "bg-red-500/20 border border-red-500 text-red-300"
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Heart className="text-accent" size={28} />
              My Wishlist
            </h1>
            <p className="text-gray-400">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"} saved
            </p>
          </motion.div>
 
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-secondary/60 border border-primary/20 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : wishlistItems.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Heart size={64} className="mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
              <p className="text-gray-400 mb-8">
                Explore our collections and add your favorite products to your wishlist
              </p>
              <button
                onClick={() => router.push("/products")}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-accent transition-colors"
              >
                Continue Shopping
              </button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {wishlistItems.map((item, index) => (
                <motion.div
                  key={item.product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-[#1A2E20]/90 rounded-xl overflow-hidden border border-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-300 backdrop-blur-md relative z-10"
                >
                  {/* Product Image */}
                  <div className="relative h-64 bg-[#111E16]/60 flex items-center justify-center overflow-hidden border-b border-[#D4AF37]/10">
                    <div className="text-6xl opacity-20 group-hover:scale-110 transition-transform duration-300">
                      🎨
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRemove(item.product._id)}
                      className="absolute top-4 right-4 p-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg transition"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 capitalize">
                      {typeof item.product.category === 'object' && item.product.category ? (item.product.category as any).name : item.product.category || "Decor"}
                    </p>

                    {/* Rating */}
                    {item.product.rating && (
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-yellow-400 text-sm">
                          ⭐ {item.product.rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="mb-4 pb-4 border-b border-[#2A4734]">
                      <p className="text-2xl font-bold text-[#D4AF37]">
                        ₹{item.product.price?.toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddToCart(item.product)}
                      className="w-full px-4 py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#C9A52C] transition flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={20} />
                      Add to Cart
                    </motion.button>
                  </div>
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
              <div className="bg-[#1A2E20]/90 border border-[#D4AF37]/10 rounded-xl p-6 backdrop-blur-md relative z-10">
                <p className="text-gray-400 mb-2">Total Value</p>
                <p className="text-3xl font-bold text-[#D4AF37]">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </p>
              </div>
 
              {/* Items Card */}
              <div className="bg-[#1A2E20]/90 border border-[#D4AF37]/10 rounded-xl p-6 backdrop-blur-md relative z-10">
                <p className="text-gray-400 mb-2">Total Items</p>
                <p className="text-3xl font-bold text-[#D4AF37]">
                  {wishlistItems.length}
                </p>
              </div>
 
              {/* Clear Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearWishlist}
                className="bg-red-500/10 border border-red-500/20 hover:border-red-500 rounded-xl p-6 text-red-400 hover:text-red-300 font-bold transition text-center relative z-10"
              >
                Clear Wishlist
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
      </main>
    </div>
  );
}
