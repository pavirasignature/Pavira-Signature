"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { config } from "@/lib/config";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const cart = useStore((state: any) => state.cart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const updateQuantity = useStore((state: any) => state.updateCartQuantity);

  const subtotal = cart.reduce((total: number, item: any) => total + (item.price * item.quantity), 0);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[450px] bg-background/95 backdrop-blur-2xl border-l border-border z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-brand text-foreground flex items-center gap-3">
                <ShoppingBag size={24} />
                Your Collection
              </h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-accent hover:rotate-90 transition-all duration-300"
              >
                <X size={28} strokeWidth={1.5} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <ShoppingBag size={64} className="text-muted-foreground mb-4 opacity-50" />
                  <p className="text-lg font-brand text-foreground">Your gallery is empty.</p>
                  <button onClick={onClose} className="mt-4 text-xs tracking-widest uppercase text-muted-foreground underline underline-offset-4">Continue Exploring</button>
                </div>
              ) : (
                cart.map((item: any) => (
                  <motion.div
                    key={item.product}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-4 bg-muted/50 p-3 rounded-xl border border-border/50 hover:border-accent transition-colors"
                  >
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.image || config.images.productPlaceholder}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col flex-1 justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-brand text-foreground text-lg leading-tight line-clamp-2">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.product)}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-foreground/80 font-semibold text-sm mt-1">
                          ₹{item.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
                          <button
                            onClick={() => updateQuantity(item.product, Math.max(1, item.quantity - 1))}
                            className="px-3 py-1 text-muted-foreground hover:bg-muted transition-colors"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-foreground text-xs font-bold min-w-[30px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product, item.quantity + 1)}
                            className="px-3 py-1 text-muted-foreground hover:bg-muted transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-border bg-background backdrop-blur-lg">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Subtotal</span>
                  <span className="text-2xl font-brand text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full group relative flex items-center justify-center gap-3 bg-foreground text-background py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-foreground/90 transition-colors overflow-hidden"
                >
                  <span className="relative z-10">Proceed to Checkout</span>
                  <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </Link>
                <p className="text-center text-[10px] text-muted-foreground mt-4 tracking-wider">
                  Shipping & taxes calculated at checkout.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
