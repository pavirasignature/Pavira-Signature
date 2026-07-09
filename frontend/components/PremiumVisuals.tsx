"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    // Disable heavy mouse tracking on touch devices to save mobile battery and CPU
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;

    let ticking = false;
    const updateMousePosition = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setMousePosition({ x: e.clientX, y: e.clientY });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);
  return mousePosition;
}

export const PremiumMandala = () => {
  return (
    <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-2xl" style={{ willChange: "transform" }}>
      <defs>
        <radialGradient id="goldGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#FFF2CD" />
          <stop offset="40%" stopColor="#D4AF37" />
          <stop offset="80%" stopColor="#997A15" />
          <stop offset="100%" stopColor="#5C4808" />
        </radialGradient>
      </defs>
      {/* Removed heavy SVG filter glow for massive performance gain on mobile */}
      <g fill="none" stroke="url(#goldGradient)" strokeWidth="2">
        {[...Array(12)].map((_, i) => (
          <path
            key={`outer-${i}`}
            d="M250 50 C300 150, 450 200, 250 250 C50 200, 200 150, 250 50"
            transform={`rotate(${i * 30} 250 250)`}
            strokeWidth="3"
            className="opacity-80"
          />
        ))}
        {[...Array(16)].map((_, i) => (
          <path
            key={`mid-${i}`}
            d="M250 100 C280 160, 380 180, 250 250 C120 180, 220 160, 250 100"
            transform={`rotate(${i * 22.5} 250 250)`}
            fill="rgba(212,175,55,0.05)"
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <circle key={`circle-${i}`} cx="250" cy="150" r="40" transform={`rotate(${i * 45} 250 250)`} />
        ))}
        <path d="M250 200 L260 240 L300 250 L260 260 L250 300 L240 260 L200 250 L240 240 Z" fill="url(#goldGradient)" />
        <circle cx="250" cy="250" r="180" strokeWidth="1" strokeDasharray="10 5" />
        <circle cx="250" cy="250" r="140" strokeWidth="2" />
        <circle cx="250" cy="250" r="90" strokeWidth="4" />
        <circle cx="250" cy="250" r="40" strokeWidth="1" strokeDasharray="4 4" />
      </g>
    </svg>
  );
};

export default function PremiumVisuals() {
  const mousePosition = useMousePosition();
  const [particles, setParticles] = useState<Array<{x: number, y: number, size: number, speed: number, delay: number}>>([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 20 + 15,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  return (
    <>
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 mix-blend-screen"
        animate={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(212, 175, 55, 0.1), transparent 80%)`,
        }}
      />
      <div className="pointer-events-none fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#D4AF37] opacity-[0.02] blur-[120px] z-0" />
      <div className="pointer-events-none fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#1A4F3E] opacity-[0.15] blur-[150px] z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full bg-[#D4AF37] ${i > 8 ? "hidden md:block" : ""}`}
            style={{ width: p.size, height: p.size, left: `${p.x}%`, opacity: 0.1 + (p.size / 15), willChange: "transform" }}
            animate={{ y: ["110vh", "-10vh"], rotate: [0, 360] }}
            transition={{ duration: p.speed, repeat: Infinity, ease: "linear", delay: p.delay }}
          />
        ))}
      </div>
    </>
  );
}
