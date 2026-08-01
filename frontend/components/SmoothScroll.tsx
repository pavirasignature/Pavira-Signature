"use client";

import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    root.style.scrollBehavior = "smooth";
    root.style.scrollPaddingTop = "88px";

    return () => {
      root.style.scrollBehavior = "";
      root.style.scrollPaddingTop = "";
    };
  }, []);

  return null;
}
