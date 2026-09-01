"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw, Zap } from "lucide-react";

export default function AutoRefreshWidget() {
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Only check if we are in a browser
    if (typeof window === "undefined") return;

    const currentVersion = process.env.NEXT_PUBLIC_BUILD_TIME || 'dev';
    
    // Check for a new deployment version
    const checkVersion = async () => {
      try {
        const res = await fetch(`/api/version?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            // If the server returns a different build time, a new deployment is live!
            if (data.version && data.version !== 'dev' && currentVersion !== 'dev' && data.version !== currentVersion) {
              console.log("New deployment detected! Showing update screen...");
              setIsUpdating(true);
              
              // Wait for the beautiful overlay to fade in before forcing the hard reload
              setTimeout(() => {
                window.location.reload();
              }, 2500);
            }
          }
        }
      } catch (error) {
        // Ignore fetch errors
      }
    };

    // Check for new deployments every 10 seconds
    const timer = setInterval(checkVersion, 10000);
    
    // Initial check after 5 seconds
    const initialTimer = setTimeout(checkVersion, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(initialTimer);
    };
  }, []);

  // Globally intercept ChunkLoadError caused by Next.js when new deployments invalidate old JS chunks
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleChunkError = (e: any) => {
      const isChunkError = 
        e?.message?.match(/ChunkLoadError/i) || 
        e?.reason?.message?.match(/ChunkLoadError/i) ||
        e?.message?.match(/Loading chunk/i) ||
        e?.reason?.message?.match(/Loading chunk/i);

      if (isChunkError && !isUpdating) {
        console.log("ChunkLoadError intercepted! Forcing seamless update...");
        e.preventDefault(); // Prevent crash
        setIsUpdating(true);
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      }
    };

    window.addEventListener("error", handleChunkError, true);
    window.addEventListener("unhandledrejection", handleChunkError, true);

    return () => {
      window.removeEventListener("error", handleChunkError, true);
      window.removeEventListener("unhandledrejection", handleChunkError, true);
    };
  }, [isUpdating]);

  return (
    <AnimatePresence>
      {isUpdating && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-br from-[#0B3B2E]/98 via-[#07271F]/96 to-[#0B3B2E]/98 backdrop-blur-xl"
        >
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"
            />
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-md"
          >
            {/* Animated Icon Container */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring", damping: 12 }}
              className="mb-8 relative"
            >
              <div className="absolute inset-0 w-20 h-20 bg-[#D4AF37]/20 rounded-full blur-2xl animate-pulse" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border-2 border-[#D4AF37]/40 flex items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <RefreshCw className="w-10 h-10 text-[#D4AF37]" strokeWidth={1.5} />
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-3xl md:text-4xl font-serif font-bold text-[#F5F0E6] tracking-tight mb-4"
            >
              Updating <span className="text-[#D4AF37]">Experience</span>
            </motion.h2>
            
            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="w-16 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-6"
            />

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-[#F5F0E6]/75 font-light text-base md:text-lg leading-relaxed mb-8"
            >
              We are seamlessly applying the latest enhancements to your experience. 
              <br className="hidden md:block" />
              Please stay with us.
            </motion.p>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Zap className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
              </motion.div>
              <span className="text-xs text-[#D4AF37] font-semibold tracking-widest uppercase">
                Live Enhancement in Progress
              </span>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="w-full mt-8 h-1 bg-[#D4AF37]/10 rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/60 to-[#D4AF37]/20"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
