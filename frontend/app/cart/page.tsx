"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import { orderService } from "@/lib/services";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateCartQuantity, clearCart } = useStore();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const itemsPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingPrice = itemsPrice >= 999 ? 0 : 99;
  const taxPrice = 0; // GST removed
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    updateCartQuantity(productId, quantity);
    setSyncing(true);
    try {
      await orderService.updateCartItem(productId, { quantity });
    } catch (error) {
      toast.error("Failed to update cart");
    } finally {
      setSyncing(false);
    }
  };

  const handleRemove = async (productId: string) => {
    removeFromCart(productId);
    setSyncing(true);
    try {
      const response = await orderService.removeFromCart(productId);
      if (!response.success) {
        toast.error(response.message || "Failed to remove item");
      } else {
        toast.success("Item removed from cart");
      }
    } catch (error: any) {
      console.error("Remove from cart error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to remove item from cart",
      );
    } finally {
      setSyncing(false);
    }
  };

  const hasOutOfStockItems = cart.some((item) => item.stock != null && item.stock <= 0);

  const handleCheckout = () => {
    if (hasOutOfStockItems) {
      toast.error("One or more items in your cart are out of stock", {
        style: { background: "#1A1A1A", color: "#F9F6F0", border: "1px solid #A85751" },
        iconTheme: { primary: "#A85751", secondary: "#F9F6F0" }
      });
      return;
    }
    router.push("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9F6F0] text-[#1A1A1A]">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-24 pb-12">
          <div className="container mx-auto px-4 text-center">
            <ShoppingBag size={48} strokeWidth={1} className="mx-auto mb-6 text-[#1A1A1A]/40" />
            <h2 className="text-3xl mb-4 font-serif text-[#1A1A1A]">Your cart is empty</h2>
            <p className="text-[#1A1A1A]/60 mb-8 font-light text-sm">
              Add some products to get started
            </p>
            <button
              onClick={() => router.push("/products")}
              className="bg-[#0C3A2E] text-white px-8 py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-[#0C3A2E]/90 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F6F0] text-[#1A1A1A]">
      <Header />

      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl mb-8 font-serif text-[#1A1A1A]">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <motion.div
                  key={item.product}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-sm p-4 border border-[#1A1A1A]/10 flex gap-4"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-[#F9F6F0] border border-[#1A1A1A]/10 shrink-0">
                    <img
                      src={item.image || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-sm text-[#1A1A1A] line-clamp-1 pr-4">{item.name}</h3>
                        <button
                          onClick={() => handleRemove(item.product)}
                          disabled={syncing}
                          className="text-[#1A1A1A]/40 hover:text-[#A85751] transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-[#1A1A1A] font-bold mt-1 text-sm">
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>

                    {item.stock != null && item.stock <= 0 ? (
                      <div className="text-[#A85751] text-[10px] uppercase font-bold tracking-wider mt-2 flex items-center gap-1">
                        Currently out of stock
                      </div>
                    ) : (
                      /* Quantity */
                      <div className="flex items-center space-x-1 mt-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.product, item.quantity - 1)}
                          disabled={syncing}
                          className="w-7 h-7 flex items-center justify-center border border-[#1A1A1A]/10 hover:border-[#0C3A2E] text-[#1A1A1A] transition-colors disabled:opacity-50"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-medium text-[#1A1A1A]">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product, item.quantity + 1)}
                          disabled={syncing || item.quantity >= (item.stock || 9999)}
                          className="w-7 h-7 flex items-center justify-center border border-[#1A1A1A]/10 hover:border-[#0C3A2E] text-[#1A1A1A] transition-colors disabled:opacity-50"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-sm p-6 border border-[#1A1A1A]/10 sticky top-28 shadow-sm">
                <h2 className="text-lg font-bold mb-6 text-[#1A1A1A] font-serif">Order Summary</h2>

                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#1A1A1A]/60">Subtotal</span>
                    <span className="text-[#1A1A1A] font-medium">₹{itemsPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1A1A1A]/60">Shipping</span>
                    <span className="text-[#1A1A1A] font-medium">
                      {shippingPrice === 0 ? "Free" : `₹${shippingPrice}`}
                    </span>
                  </div>

                  <div className="border-t border-[#1A1A1A]/10 pt-4">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-bold text-[#1A1A1A]">Total</span>
                      <span className="font-serif font-bold text-[#1A1A1A]">
                        ₹{totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading || syncing || hasOutOfStockItems}
                  className="w-full bg-[#0C3A2E] text-white py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-[#0C3A2E]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      Proceed to Checkout
                      <ArrowRight size={16} className="ml-2" />
                    </>
                  )}
                </button>

                {hasOutOfStockItems && (
                  <p className="text-[#A85751] text-[11px] font-medium text-center mt-3">
                    Please remove out of stock items to proceed.
                  </p>
                )}

                <p className="text-[10px] text-[#1A1A1A]/50 text-center mt-4 uppercase tracking-widest font-semibold">
                  Free shipping on orders above ₹999
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
