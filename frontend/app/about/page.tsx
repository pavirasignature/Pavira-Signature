"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Sparkles, Feather, Leaf, Clock, ArrowRight, Palette, Layers, Home } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { PremiumMandala } from "@/components/PremiumVisuals";

// --- Data Arrays ---

const craftsmanshipSteps = [
  {
    phase: "01",
    title: "Conception & Design",
    description: "Every masterpiece begins as a whisper of inspiration. Our master designers draft intricate geometric patterns, honoring ancient proportions while infusing modern elegance."
  },
  {
    phase: "02",
    title: "Material Selection",
    description: "We source only the finest, ethically harvested premium MDF and sustainable woods, ensuring that the canvas itself is as enduring as the art it holds."
  },
  {
    phase: "03",
    title: "Precision Handcrafting",
    description: "Guided by sacred geometry, our artisans employ both state-of-the-art precision tools and traditional hand-carving techniques to bring the patterns to life."
  },
  {
    phase: "04",
    title: "Artisanal Finishing",
    description: "Each layer is meticulously hand-painted, sanded, and finished. Gold accents are delicately applied to catch the light, completing the transformation into luxury decor."
  }
];

const artisanValues = [
  {
    icon: Sparkles,
    title: "Premium Materials",
    description: "We compromise on nothing. Only the highest-grade sustainable woods and premium finishes make it into our atelier."
  },
  {
    icon: Feather,
    title: "Handmade Excellence",
    description: "Machine precision meets human soul. Every piece passes through the hands of master craftsmen who ensure absolute perfection."
  },
  {
    icon: Leaf,
    title: "Sustainable Production",
    description: "Luxury shouldn't cost the earth. We adhere to strict eco-friendly practices, using non-toxic paints and sustainable sourcing."
  },
  {
    icon: Clock,
    title: "Timeless Design",
    description: "Our art is immune to fleeting trends. We create enduring masterpieces designed to be cherished for generations."
  }
];

const lifestyleImages = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
];

// --- Subcomponents ---

const ParallaxImage = ({ src, speed = 1, className = "" }: { src: string, speed?: number, className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-[-20%] w-[140%] h-[140%]">
        <Image src={src} alt="Lifestyle Gallery" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
      </motion.div>
    </div>
  );
};

export default function AboutPage() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(heroProgress, [0, 1], ["0%", "50%"]);

  const geometryRef = useRef(null);
  const { scrollYProgress: geoProgress } = useScroll({
    target: geometryRef,
    offset: ["start end", "end start"]
  });
  const mandalaRotate1 = useTransform(geoProgress, [0, 1], [0, 180]);
  const mandalaRotate2 = useTransform(geoProgress, [0, 1], [0, -180]);

  return (
    <PublicLayout>
      <main className="bg-[#07241D] text-[#F5F0E6] selection:bg-[#D4AF37] selection:text-[#0B3B2E] overflow-hidden">
        
        {/* 1. About Hero (Cinematic Entry) */}
        <section ref={heroRef} className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
          {/* Deep Cinematic Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.6)_0%,rgba(7,36,29,1)_100%)] z-0" />
          
          <motion.div 
            style={{ opacity: heroOpacity, y: heroY }}
            className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none"
          >
            <div className="w-[150vw] h-[150vw] md:w-[80vw] md:h-[80vw]">
              <PremiumMandala />
            </div>
          </motion.div>

          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-[#D4AF37] font-semibold tracking-[0.3em] uppercase text-sm mb-6"
            >
              Our Heritage
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5 }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight drop-shadow-2xl"
            >
              The Art Behind<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F5F0E6] italic font-light">
                Every Creation
              </span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-xs uppercase tracking-widest text-[#D4AF37]">Discover</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="text-[#D4AF37]" size={24} strokeWidth={1} />
            </motion.div>
          </motion.div>
        </section>

        {/* 2. Brand Philosophy (Editorial Layout) */}
        <section className="py-32 relative z-10 bg-[#07241D]">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
              <div className="space-y-8 w-full">
                <motion.h2 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="text-4xl md:text-5xl font-serif leading-snug"
                >
                  We believe décor is not only about filling walls. It is about <span className="text-[#D4AF37] italic">creating moments.</span>
                </motion.h2>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-6 text-[#F5F0E6]/70 text-lg font-light leading-relaxed text-center"
                >
                  <p>
                    Based in <strong className="text-[#D4AF37]">Ahmedabad, Gujarat, India</strong>, <span className="font-brand">Pavira Signature</span> creates premium wall clocks, wall arts, hand-painted canvas paintings and designer home décor products for people who want their spaces to feel special.
                  </p>
                  <p>
                    Our products are designed to add more than beauty. They add emotion, personality and a signature touch to your home, office, studio, showroom, hotel, café or premium interior. Whether it is a wall clock that becomes the centre of your living room, a hand-painted canvas painting that brings calmness to your bedroom, or wall art that gives your office a premium identity — every Pavira Signature product is made to create a feeling.
                  </p>
                  <div className="bg-[#112F24]/50 border border-[#D4AF37]/15 p-6 rounded-2xl space-y-4 text-left max-w-xl mx-auto">
                    <h4 className="text-lg font-serif text-[#D4AF37] text-center">Our Vision & Mission</h4>
                    <p className="text-sm">
                      <strong>Our Vision:</strong> To become a trusted premium home décor brand in India, known for designs that make spaces feel elegant, warm and memorable.
                    </p>
                    <p className="text-sm">
                      <strong>Our Mission:</strong> To create décor products that combine beauty, quality and emotion — so every customer can experience the joy of transforming their space.
                    </p>
                  </div>
                  <div className="space-y-2 text-center max-w-sm mx-auto">
                    <h4 className="text-lg font-serif text-[#D4AF37]">Our Belief</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 inline-block text-left">
                      <li>A welcoming living room</li>
                      <li>A peaceful bedroom</li>
                      <li>A premium office</li>
                      <li>A beautiful corner that makes you smile every day</li>
                    </ul>
                  </div>
                  <p className="text-sm border-t border-[#D4AF37]/20 pt-4 max-w-xl mx-auto">
                    <strong className="text-[#D4AF37]">Our Promise:</strong> We promise to bring you décor that does not just look good, but feels right. Because your space is more than four walls. It is your comfort, your pride, your lifestyle and your signature.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Create Section */}
        <section className="py-32 bg-[#0B3B2E]/30 border-t border-[#D4AF37]/10 relative z-10">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-20">
              <span className="text-[#D4AF37] tracking-widest uppercase text-sm font-semibold block mb-4">Our Collections</span>
              <h2 className="text-4xl md:text-5xl font-serif text-[#F5F0E6]">What We Create</h2>
              <p className="text-[#F5F0E6]/70 max-w-2xl mx-auto font-light mt-4">
                Thoughtfully designed and handcrafted pieces to elevate your spaces.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Wall Clocks */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-[#112F24]/60 border border-[#D4AF37]/15 hover:border-[#D4AF37]/45 p-8 rounded-3xl backdrop-blur-xl shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center mb-6 text-[#D4AF37] group-hover:scale-110 transition-transform duration-300">
                  <Clock size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-serif text-[#F5F0E6] mb-3 group-hover:text-[#D4AF37] transition-colors">Wall Clocks</h3>
                <p className="text-[#F5F0E6]/60 text-sm font-light leading-relaxed">
                  Designed to bring elegance, balance and timeless beauty to your walls.
                </p>
              </motion.div>

              {/* Wall Arts */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-[#112F24]/60 border border-[#D4AF37]/15 hover:border-[#D4AF37]/45 p-8 rounded-3xl backdrop-blur-xl shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center mb-6 text-[#D4AF37] group-hover:scale-110 transition-transform duration-300">
                  <Layers size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-serif text-[#F5F0E6] mb-3 group-hover:text-[#D4AF37] transition-colors">Wall Arts</h3>
                <p className="text-[#F5F0E6]/60 text-sm font-light leading-relaxed">
                  Created to add personality, depth and a premium feel to your interiors.
                </p>
              </motion.div>

              {/* Hand-Painted Canvas Paintings */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-[#112F24]/60 border border-[#D4AF37]/15 hover:border-[#D4AF37]/45 p-8 rounded-3xl backdrop-blur-xl shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center mb-6 text-[#D4AF37] group-hover:scale-110 transition-transform duration-300">
                  <Palette size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-serif text-[#F5F0E6] mb-3 group-hover:text-[#D4AF37] transition-colors">Canvas Paintings</h3>
                <p className="text-[#F5F0E6]/60 text-sm font-light leading-relaxed">
                  Authentic artwork, carefully made to bring emotion, calmness and artistic beauty into your space. Each hand-painted piece may carry slight variations in texture and strokes, making it truly one of a kind.
                </p>
              </motion.div>

              {/* Designer Home Décor Products */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-[#112F24]/60 border border-[#D4AF37]/15 hover:border-[#D4AF37]/45 p-8 rounded-3xl backdrop-blur-xl shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center mb-6 text-[#D4AF37] group-hover:scale-110 transition-transform duration-300">
                  <Home size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-serif text-[#F5F0E6] mb-3 group-hover:text-[#D4AF37] transition-colors">Designer Décor</h3>
                <p className="text-[#F5F0E6]/60 text-sm font-light leading-relaxed">
                  Thoughtfully crafted to complete your home with a refined signature touch.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. Sacred Geometry Section */}
        <section ref={geometryRef} className="py-32 relative overflow-hidden bg-[#0B3B2E] border-y border-[#D4AF37]/10">
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-[#D4AF37] tracking-widest uppercase text-sm font-semibold block mb-4">The Golden Ratio</span>
              <h2 className="text-4xl md:text-6xl font-serif mb-6">Sacred Geometry</h2>
              <p className="text-[#F5F0E6]/70 text-lg font-light">
                Our designs are deeply rooted in the universal language of mathematics and nature. The mandala represents wholeness, a cosmic diagram that reminds us of our relation to the infinite.
              </p>
            </div>

            <div className="relative h-[600px] w-full flex items-center justify-center">
              <motion.div style={{ rotate: mandalaRotate1 }} className="absolute w-[800px] h-[800px] opacity-10">
                <PremiumMandala />
              </motion.div>
              <motion.div style={{ rotate: mandalaRotate2 }} className="absolute w-[600px] h-[600px] opacity-30">
                <PremiumMandala />
              </motion.div>
              <div className="absolute w-64 h-64 rounded-full bg-[#D4AF37]/5 backdrop-blur-3xl border border-[#D4AF37]/20 flex items-center justify-center shadow-[0_0_100px_rgba(212,175,55,0.1)]">
                <span className="text-[#D4AF37] font-serif text-3xl italic">Harmony</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Craftsmanship Journey */}
        <section className="py-32 bg-[#07241D] relative">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-serif">The Craftsmanship Journey</h2>
            </div>

            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-[#D4AF37]/20 -translate-x-1/2" />
              
              {craftsmanshipSteps.map((step, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className={`relative flex flex-col md:flex-row gap-8 md:gap-0 items-center mb-24 last:mb-0 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.5)] z-10 border-4 border-[#07241D]" />
                  
                  <div className={`w-full md:w-1/2 pl-20 md:pl-0 ${index % 2 === 0 ? 'md:pl-16' : 'md:pr-16 text-left md:text-right'}`}>
                    <span className="text-6xl font-serif text-[#D4AF37]/10 absolute md:static -top-6 left-16 md:left-auto font-bold">{step.phase}</span>
                    <h3 className="text-2xl font-serif text-[#D4AF37] mb-4 mt-2 md:mt-0">{step.title}</h3>
                    <p className="text-[#F5F0E6]/70 font-light leading-relaxed">{step.description}</p>
                  </div>
                  
                  <div className="hidden md:block w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Artisan Values */}
        <section className="py-32 relative bg-[#112F24]">
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-serif mb-6">Our Artisan Values</h2>
              <p className="text-[#F5F0E6]/70 max-w-2xl mx-auto font-light">
                The pillars that define every <span className="font-brand">Pavira Signature</span> creation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {artisanValues.map((val, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-[#07241D]/50 backdrop-blur-xl border border-[#D4AF37]/10 p-8 rounded-2xl hover:border-[#D4AF37]/40 transition-colors duration-500 group"
                >
                  <val.icon className="text-[#D4AF37] mb-6 w-10 h-10 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                  <h3 className="text-xl font-serif mb-3 text-[#F5F0E6] group-hover:text-[#D4AF37] transition-colors">{val.title}</h3>
                  <p className="text-[#F5F0E6]/60 text-sm leading-relaxed font-light">{val.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Lifestyle Showcase (Parallax Gallery) */}
        <section className="py-32 bg-[#07241D] overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-serif mb-6">The Gallery Experience</h2>
              <p className="text-[#F5F0E6]/70 max-w-2xl mx-auto font-light">
                Elevating spaces worldwide with unparalleled craftsmanship.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[900px]">
              <div className="md:col-span-7 flex flex-col gap-6">
                <ParallaxImage src={lifestyleImages[0]} className="h-[400px] md:h-[60%] rounded-2xl" speed={1.2} />
                <ParallaxImage src={lifestyleImages[1]} className="h-[300px] md:h-[40%] rounded-2xl" speed={0.8} />
              </div>
              <div className="md:col-span-5 flex flex-col gap-6">
                <ParallaxImage src={lifestyleImages[2]} className="h-[300px] md:h-[35%] rounded-2xl" speed={0.9} />
                <ParallaxImage src={lifestyleImages[3]} className="h-[400px] md:h-[65%] rounded-2xl" speed={1.1} />
              </div>
            </div>
          </div>
        </section>

        {/* 7. Closing Statement */}
        <section className="py-32 relative bg-[#0B3B2E] border-t border-[#D4AF37]/20 flex items-center justify-center text-center px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.1)_0%,rgba(11,59,46,1)_100%)] z-0" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative z-10 max-w-3xl"
          >
            <h2 className="text-5xl md:text-7xl font-serif mb-8 italic">Ready to transform your space?</h2>
            <p className="text-xl text-[#F5F0E6]/70 mb-12 font-light">
              Explore our curated collections and find the perfect masterpiece for your sanctuary.
            </p>
            
            <Link 
              href="/products"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#D4AF37] text-[#0B3B2E] font-bold uppercase tracking-widest text-sm rounded-full hover:bg-[#E6C78B] transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:-translate-y-1"
            >
              Explore Collections
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </section>

      </main>
    </PublicLayout>
  );
}
