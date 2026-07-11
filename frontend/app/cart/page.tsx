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

  const hasOutOfStockItems = cart.some((item) => item.stock === 0);

  const handleCheckout = () => {
    if (hasOutOfStockItems) {
      toast.error("please check our website after few time till then pls stay connect to us");
      return;
    }
    router.push("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#1B2D20] text-[#F5F0E6] relative overflow-hidden">
        {/* Full Page Fixed Background Gradient */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />
        <Header />
        <main className="flex-grow pt-24 pb-12 relative z-10">
          <div className="container mx-auto px-4 text-center">
            <ShoppingBag size={64} className="mx-auto mb-4 text-[#D4AF37]/40" />
            <h2 className="text-2xl font-bold mb-4 font-serif text-[#D4AF37]">Your cart is empty</h2>
            <p className="text-[#F5F0E6]/60 mb-8 font-light">
              Add some products to get started
            </p>
            <button
              onClick={() => router.push("/products")}
              className="bg-[#D4AF37] text-[#07271F] px-8 py-4 rounded-xl font-semibold hover:bg-[#E6C78B] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]"
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
    <div className="min-h-screen flex flex-col bg-[#1B2D20] text-[#F5F0E6] relative overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />
      <Header />

      <main className="flex-grow pt-24 pb-12 relative z-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 font-serif text-[#F5F0E6]">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <motion.div
                  key={item.product}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#1A2E20]/90 rounded-lg p-4 border border-[#D4AF37]/20"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-[#111E16] rounded-lg overflow-hidden flex-shrink-0 border border-[#D4AF37]/10">
                      <img
                        src={item.image || "/placeholder.jpg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 text-[#F5F0E6]">{item.name}</h3>
                      <p className="text-[#D4AF37] font-bold mb-2">
                        ₹{item.price.toLocaleString()}
                      </p>

                      {item.stock === 0 ? (
                        <div className="text-red-400 text-xs font-light bg-red-950/20 border border-red-500/10 p-3 rounded-lg max-w-md">
                          please check our website after few time till then pls stay connect to us
                        </div>
                      ) : (
                        /* Quantity */
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.product,
                                item.quantity - 1,
                              )
                            }
                            disabled={syncing}
                            className="w-8 h-8 bg-[#111E16] rounded flex items-center justify-center hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] transition-colors border border-[#D4AF37]/20 disabled:opacity-50 text-[#F5F0E6]"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center text-[#F5F0E6]">{item.quantity}</span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.product,
                                item.quantity + 1,
                              )
                            }
                            disabled={syncing || item.quantity >= (item.stock || 9999)}
                            className="w-8 h-8 bg-[#111E16] rounded flex items-center justify-center hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] transition-colors border border-[#D4AF37]/20 disabled:opacity-50 text-[#F5F0E6]"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(item.product)}
                      disabled={syncing}
                      className="text-[#D4AF37]/50 hover:text-red-400 transition-colors disabled:opacity-50 self-start p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#1A2E20]/90 rounded-lg p-6 border border-[#D4AF37]/20 sticky top-24">
                <h2 className="text-xl font-bold mb-4 text-[#F5F0E6]">Order Summary</h2>

                <div className="space-y-3 mb-6 font-light">
                  <div className="flex justify-between">
                    <span className="text-[#F5F0E6]/60">Subtotal</span>
                    <span className="text-[#F5F0E6]">₹{itemsPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#F5F0E6]/60">Shipping</span>
                    <span className="text-[#F5F0E6]">
                      {shippingPrice === 0 ? "Free" : `₹${shippingPrice}`}
                    </span>
                  </div>

                  <div className="border-t border-[#D4AF37]/20 pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-[#F5F0E6]">Total</span>
                      <span className="text-[#D4AF37]">
                        ₹{totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading || syncing || hasOutOfStockItems}
                  className="w-full bg-[#D4AF37] text-[#07271F] py-4 rounded-xl font-semibold hover:bg-[#E6C78B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      Proceed to Checkout
                      <ArrowRight size={20} className="ml-2" />
                    </>
                  )}
                </button>

                {hasOutOfStockItems && (
                  <p className="text-red-400 text-xs text-center mt-4 font-light">
                    please check our website after few time till then pls stay connect to us
                  </p>
                )}

                <p className="text-xs text-[#F5F0E6]/40 text-center mt-4">
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
