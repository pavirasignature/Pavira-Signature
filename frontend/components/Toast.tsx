"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X } from "lucide-react";

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

  return (
    <div className="fixed top-24 right-4 z-50 space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 100 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold backdrop-blur-md border ${
              toast.type === "success"
                ? "bg-green-500/20 border-green-500 text-green-300"
                : toast.type === "error"
                  ? "bg-red-500/20 border-red-500 text-red-300"
                  : "bg-blue-500/20 border-blue-500 text-blue-300"
            }`}
          >
            {toast.type === "success" && <CheckCircle size={20} />}
            {toast.type === "error" && <AlertCircle size={20} />}
            <span>{toast.message}</span>
            <button
              onClick={() => toastStore.remove(toast.id)}
              className="ml-4 hover:opacity-80 transition"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default toastStore;
