"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

const toastStore = {
  toasts: [] as Toast[],
  listeners: [] as ((toasts: Toast[]) => void)[],

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  },

  notify(message: string, type: ToastType = "info", duration = 3000) {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, message, type, duration };
    this.toasts = [toast, ...this.toasts];
    this.listeners.forEach((l) => l(this.toasts));

    if (duration > 0) {
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
        this.listeners.forEach((l) => l(this.toasts));
      }, duration);
    }

    return id;
  },

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.listeners.forEach((l) => l(this.toasts));
  },
};

export function useToast() {
  return useCallback(
    (message: string, type: ToastType = "info", duration = 3000) => {
      return toastStore.notify(message, type, duration);
    },
    [],
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  React.useEffect(() => {
    return toastStore.subscribe(setToasts);
  }, []);

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-gradient-to-r from-[#2E8B57]/20 to-[#2E8B57]/5",
          border: "border border-[#2E8B57]/50 hover:border-[#2E8B57]/80",
          text: "text-[#2E8B57]",
          icon: "text-[#2E8B57]",
          shadow: "shadow-[0_0_15px_rgba(46,139,87,0.1)]",
        };
      case "error":
        return {
          bg: "bg-gradient-to-r from-[#D32F2F]/20 to-[#D32F2F]/5",
          border: "border border-[#D32F2F]/50 hover:border-[#D32F2F]/80",
          text: "text-[#D32F2F]",
          icon: "text-[#D32F2F]",
          shadow: "shadow-[0_0_15px_rgba(211,47,47,0.1)]",
        };
      default: // info
        return {
          bg: "bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/5",
          border: "border border-[#D4AF37]/50 hover:border-[#D4AF37]/80",
          text: "text-[#D4AF37]",
          icon: "text-[#D4AF37]",
          shadow: "shadow-[0_0_15px_rgba(212,175,55,0.1)]",
        };
    }
  };

  return (
    <div className="fixed top-24 right-4 z-50 space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, x: 100, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={`flex items-center gap-3 px-5 py-3 rounded-full font-semibold backdrop-blur-xl ${styles.bg} ${styles.border} ${styles.shadow} bg-[#0B3B2E] border-[#D4AF37]/30 pointer-events-auto transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.2)]`}
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15, delay: 0.1 }}
                className={`flex-shrink-0 ${styles.icon}`}
              >
                {toast.type === "success" && <CheckCircle size={20} strokeWidth={2} />}
                {toast.type === "error" && <AlertCircle size={20} strokeWidth={2} />}
                {toast.type === "info" && <Info size={20} strokeWidth={2} />}
              </motion.div>

              {/* Message */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className={`text-sm ${styles.text} font-medium`}
              >
                {toast.message}
              </motion.span>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toastStore.remove(toast.id)}
                className={`ml-4 flex-shrink-0 ${styles.text} hover:opacity-100 opacity-70 transition-all duration-200`}
              >
                <X size={18} strokeWidth={2} />
              </motion.button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default toastStore;
