"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

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
          animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#07241B]/95"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center px-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="mb-8"
            >
              <Loader2 className="w-12 h-12 text-[#D4AF37]" />
            </motion.div>
            
            <h2 className="text-2xl md:text-3xl font-serif text-[#D4AF37] tracking-wide mb-4">
              Updating Experience
            </h2>
            
            <p className="text-[#F5F0E6]/70 font-light text-sm md:text-base max-w-md mx-auto leading-relaxed">
              We are seamlessly applying the latest bespoke enhancements to your website. 
              <br className="hidden md:block" />
              Thank you for your patience.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
