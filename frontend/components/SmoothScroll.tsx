"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Reset scroll to top on page load to prevent scroll-on-refresh issue
    window.scrollTo(0, 0);

    // Initialize Lenis for premium inertia-based smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easing for fast start & smooth end
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    // Request Animation Frame loop
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Global scroll padding top config for the floating header
    const root = document.documentElement;
    root.style.scrollPaddingTop = "88px";

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      root.style.scrollPaddingTop = "";
    };
  }, []);

  return null;
}
