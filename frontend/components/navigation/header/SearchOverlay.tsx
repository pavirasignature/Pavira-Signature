"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-foreground/90 hover:text-accent transition group flex items-center justify-center"
      >
        <Search size={22} strokeWidth={1.5} />
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-accent group-hover:w-full transition-all duration-300"></span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-start justify-center pt-32 px-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-transparent"
            />
            
            <motion.div
              initial={{ y: -50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -50, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative w-full max-w-3xl bg-background border border-border rounded-2xl shadow-xl overflow-hidden"
            >
              <form onSubmit={handleSearch} className="flex items-center p-2 md:p-4">
                <div className="pl-4 md:pl-6 pr-3 md:pr-4 text-muted-foreground">
                  <Search className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for masterpieces..."
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-lg md:text-3xl font-serif text-foreground placeholder:text-muted-foreground py-4 md:py-6"
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="pr-4 pl-3 py-4 md:p-6 text-muted-foreground hover:text-accent transition-colors shrink-0"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                </button>
              </form>
              <div className="bg-muted p-6 border-t border-border flex gap-4 items-center justify-center">
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Trending:</span>
                <div className="flex gap-4">
                  {["Mandala", "Wall Art", "Gold"].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        router.push(`/products?search=${term}`);
                        setIsOpen(false);
                      }}
                      className="text-sm text-foreground/80 hover:text-accent transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
