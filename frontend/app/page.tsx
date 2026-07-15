"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/layout/PublicLayout";
import { productService } from "@/lib/services";
import ProductCard from "@/components/ProductCard";

// Complex SVG Mandala Component
const PremiumMandala = () => {
  return (
    <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-2xl">
      <defs>
        <radialGradient id="goldGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#FFF2CD" />
          <stop offset="40%" stopColor="#D4AF37" />
          <stop offset="80%" stopColor="#997A15" />
          <stop offset="100%" stopColor="#5C4808" />
        </radialGradient>
      </defs>
      <g fill="none" stroke="url(#goldGradient)" strokeWidth="2">
        {/* Outer Petals */}
        {[...Array(12)].map((_, i) => (
          <path
            key={`outer-${i}`}
            d="M250 50 C300 150, 450 200, 250 250 C50 200, 200 150, 250 50"
            transform={`rotate(${i * 30} 250 250)`}
            strokeWidth="3"
            className="opacity-80"
          />
        ))}
        {/* Mid Petals */}
        {[...Array(16)].map((_, i) => (
          <path
            key={`mid-${i}`}
            d="M250 100 C280 160, 380 180, 250 250 C120 180, 220 160, 250 100"
            transform={`rotate(${i * 22.5} 250 250)`}
            fill="rgba(212,175,55,0.05)"
          />
        ))}
        {/* Inner Geometry */}
        {[...Array(8)].map((_, i) => (
          <circle
            key={`circle-${i}`}
            cx="250"
            cy="150"
            r="40"
            transform={`rotate(${i * 45} 250 250)`}
          />
        ))}
        {/* Center Star */}
        <path d="M250 200 L260 240 L300 250 L260 260 L250 300 L240 260 L200 250 L240 240 Z" fill="url(#goldGradient)" />
        {/* Concentric Circles */}
        <circle cx="250" cy="250" r="180" strokeWidth="1" strokeDasharray="10 5" />
        <circle cx="250" cy="250" r="140" strokeWidth="2" />
        <circle cx="250" cy="250" r="90" strokeWidth="4" />
        <circle cx="250" cy="250" r="40" strokeWidth="1" strokeDasharray="4 4" />
      </g>
    </svg>
  );
};

export default function PremiumLandingPage() {
  const { scrollYProgress } = useScroll();

  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Motion values for smooth spotlight tracking (bypasses React render loop)
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const spotlightSpringX = useSpring(spotlightX, { stiffness: 60, damping: 25 });
  const spotlightSpringY = useSpring(spotlightY, { stiffness: 60, damping: 25 });

  // Motion values for smooth 3D tilt tracking (bypasses React render loop)
  const tiltX = useSpring(0, { stiffness: 60, damping: 25 });
  const tiltY = useSpring(0, { stiffness: 60, damping: 25 });

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await productService.getProducts({ limit: 4 });
        setFeaturedProducts(res.data || []);
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchFeatured();
  }, []);

  // Update mouse coordinates directly into Framer Motion values
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
      return;
    }
    setIsMobile(false);

    const handleMouseMove = (e: MouseEvent) => {
      spotlightX.set(e.clientX);
      spotlightY.set(e.clientY);

      const xVal = (e.clientX / window.innerWidth - 0.5) * 20;
      const yVal = (e.clientY / window.innerHeight - 0.5) * -20;
      tiltX.set(yVal);
      tiltY.set(xVal);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [spotlightX, spotlightY, tiltX, tiltY]);

  // Parallax calculations
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Transform coordinates to radial gradient spotlight string
  const spotlightBg = useTransform(
    [spotlightSpringX, spotlightSpringY],
    ([x, y]) => `radial-gradient(800px circle at ${x}px ${y}px, rgba(212, 175, 55, 0.12), transparent 80%)`
  );

  // Generate floating particles (Desktop only)
  const [particles, setParticles] = useState<Array<{x: number, y: number, size: number, speed: number, delay: number}>>([]);
  useEffect(() => {
    if (window.innerWidth < 768) return;
    const newParticles = Array.from({ length: 10 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  return (
    <PublicLayout>
      <div className="relative min-h-screen bg-[#0B3B2E] text-[#F5F0E6] overflow-x-hidden selection:bg-[#D4AF37] selection:text-[#0B3B2E]">
      
      {/* Global Cinematic Spotlight - Desktop only */}
      {!isMobile && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 mix-blend-screen"
          style={{
            background: spotlightBg
          }}
        />
      )}
      
      {/* Ambient Glow */}
      <div className="pointer-events-none fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#D4AF37] opacity-[0.03] blur-[120px] z-0" />
      <div className="pointer-events-none fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#1A4F3E] opacity-[0.2] blur-[150px] z-0" />

      {/* Floating Particles - Desktop only */}
      {!isMobile && particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {particles.map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#D4AF37]"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                opacity: 0.15 + (p.size / 10),
                willChange: "transform"
              }}
              animate={{
                y: ["110vh", "-10vh"],
                rotate: [0, 360]
              }}
              transition={{
                duration: p.speed,
                repeat: Infinity,
                ease: "linear",
                delay: p.delay
              }}
            />
          ))}
        </div>
      )}


      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 z-10 overflow-hidden perspective-[1000px]">
        <motion.div 
          className="absolute inset-0 flex items-center justify-center opacity-80 mix-blend-screen"
          style={{ 
            rotateX: tiltX, 
            rotateY: tiltY,
            y: heroY,
            transformStyle: "preserve-3d"
          }}
        >
          <motion.div 
            className="w-[75vw] h-[75vw] sm:w-[70vw] sm:h-[70vw] md:w-[60vw] md:h-[60vw] lg:w-[55vw] lg:h-[55vw] max-w-[800px] max-h-[800px] absolute" 
            style={{ transform: "translateZ(-100px)", willChange: "transform" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          >
            <PremiumMandala />
          </motion.div>
          {/* Render secondary mandala on tablets and larger */}
          {!isMobile && (
            <motion.div 
              className="w-[85vw] h-[85vw] sm:w-[80vw] sm:h-[80vw] md:w-[70vw] md:h-[70vw] lg:w-[65vw] lg:h-[65vw] max-w-[900px] max-h-[900px] absolute opacity-30" 
              style={{ transform: "translateZ(-200px) scale(1.2)", willChange: "transform" }}
              animate={{ rotate: -360 }}
              transition={{ duration: 160, repeat: Infinity, ease: "linear" }}
            >
              <PremiumMandala />
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center pointer-events-none"
        >
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-[1.1] mb-8 tracking-tight drop-shadow-2xl text-white"
          >
            The Art of <br/> <span className="italic font-light text-[#D4AF37]">Luxury</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.2 }}
            className="pointer-events-auto"
          >
            <Link href="#collections" className="inline-flex items-center gap-4 group cursor-pointer">
              <span className="text-sm tracking-widest uppercase font-semibold text-gray-300 group-hover:text-white transition-colors">Explore Collection</span>
              <div className="w-12 h-[1px] bg-[#D4AF37]/50 group-hover:bg-[#D4AF37] group-hover:w-20 transition-all duration-500"></div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* BRAND VALUES / CRAFTSMANSHIP */}
      <section id="philosophy" className="py-32 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2 }}
            className="text-center mb-24"
          >
            <h2 className="text-3xl md:text-5xl font-serif mb-6 text-[#D4AF37]">The Art of Stillness</h2>
            <p className="max-w-2xl mx-auto text-gray-300 font-light leading-relaxed text-lg">
              Every curve, every line, and every detail is meticulously handcrafted by master artisans. 
              We transform raw materials into timeless masterpieces that elevate your living space into a gallery of luxury.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Timeless Design", desc: "Aesthetics that transcend trends, blending ancient geometry with modern luxury interior sensibilities." },
              { title: "Master Craftsmanship", desc: "Hundreds of hours dedicated to precision detailing, ensuring every mandala is a unique, museum-quality piece." },
              { title: "Sustainable Luxury", desc: "Ethically sourced premium materials crafted with environmentally conscious practices for a better tomorrow." }
            ].map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                className="group p-10 rounded-2xl bg-[#112F24]/60 backdrop-blur-xl border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all duration-500 hover:-translate-y-2 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-5 rounded-bl-full transition-transform duration-700 group-hover:scale-150" />
                <div className="text-[#D4AF37] text-4xl font-serif opacity-30 mb-6">0{i+1}</div>
                <h3 className="text-xl font-bold mb-4 uppercase tracking-wider">{val.title}</h3>
                <p className="text-gray-400 font-light leading-relaxed text-sm">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COLLECTIONS (Asymmetrical Grid) */}
      <section id="collections" className="py-32 relative z-10 bg-[#07241B]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-6 md:gap-0">
            <div>
              <p className="text-white tracking-[0.2em] uppercase text-xs font-bold mb-3 md:mb-4">Curated Exhibition</p>
              <h2 className="text-4xl md:text-6xl font-serif text-white">Signature Series</h2>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-3 text-[#D4AF37] hover:text-white transition-colors group">
              <span className="uppercase tracking-widest text-xs font-bold">View Full Gallery</span>
              <span className="w-8 h-[1px] bg-[#D4AF37] group-hover:w-16 transition-all duration-500"></span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loadingProducts ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-[400px] bg-[#112F24]/40 rounded-2xl animate-pulse"></div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <ProductCard key={product._id || product.id} product={product} />
              ))
            ) : (
              <p className="text-gray-400 col-span-full text-center">No featured products found.</p>
            )}
          </div>
        </div>
      </section>

      {/* LIFESTYLE SHOWCASE (Parallax Depth) */}
      <section className="py-40 relative z-10 overflow-hidden h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0B3B2E]/90 z-10" />
          {/* We would use a real luxury living room image here, using a gradient for now */}
          <div className="w-full h-full bg-gradient-to-br from-[#124233] to-[#041F16]" />
        </div>
        
        <div className="container mx-auto px-6 max-w-7xl relative z-20 flex flex-col items-center text-center">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1.5 }}
             className="w-40 h-40 mb-10 opacity-80"
          >
            <PremiumMandala />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-4xl md:text-6xl font-serif text-white mb-8"
          >
            Elevate Your Space
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="max-w-2xl text-gray-300 font-light text-lg mb-12"
          >
            A mandala is more than decor; it is an anchor for the soul. Placed in a home, it brings harmony, sophistication, and an undeniable aura of luxury.
          </motion.p>
        </div>
      </section>

    </div>
    </PublicLayout>
  );
}
