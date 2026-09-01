"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { productService } from "@/lib/services";
import ProductCard, { ProductSkeleton } from "@/components/ProductCard";
import {
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";

export default function HomeClient() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await productService.getProducts({ limit: 6 });
        const list = res.data?.products || res.data || [];
        setFeaturedProducts(Array.isArray(list) ? list.slice(0, 6) : []);
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    {
      title: "Wall Clocks",
      slug: "wall-clocks",
      desc: "Silent sweep, architectural timepieces",
      image:
        "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Wall Art",
      slug: "wall-arts",
      desc: "Layered metal and precision-cut panels",
      image:
        "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Canvas",
      slug: "canvas",
      desc: "Textured mixed-media wall canvasses",
      image:
        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Designer Décor",
      slug: "designer-decor",
      desc: "Accent pieces and handcrafted accents",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const manufacturingSteps = [
    {
      num: "01",
      title: "Design",
      desc: "Original silhouettes drafted in our Ahmedabad studio, proportioned specifically for modern Indian living spaces.",
    },
    {
      num: "02",
      title: "Precision Cutting",
      desc: "Industrial-grade fiber laser and CNC routers achieve micro-millimeter edge accuracy across metal and high-density panels.",
    },
    {
      num: "03",
      title: "Layering",
      desc: "Architectural stacking creates true 3D visual relief, casting natural ambient shadows without visual clutter.",
    },
    {
      num: "04",
      title: "Finishing",
      desc: "Multi-stage anti-corrosion priming followed by hand-rubbed matte textures, antique golds, and deep forest hues.",
    },
    {
      num: "05",
      title: "Quality Check",
      desc: "Every face, edge bevel, concealed wall mount, and surface finish undergoes a comprehensive inspection before sign-off.",
    },
    {
      num: "06",
      title: "Packed & Delivered",
      desc: "Shock-absorbing reinforced packaging and custom wooden crating ensure safe, zero-damage arrival anywhere in India.",
    },
  ];

  const roomCollections = [
    {
      room: "Living Room",
      desc: "Expansive focal artwork designed for 8–12 ft sofa walls.",
      link: "/products?category=wall-arts",
      image:
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
    },
    {
      room: "Bedroom",
      desc: "Restful palettes and organic geometry above headboards.",
      link: "/products?category=canvas",
      image:
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    },
    {
      room: "Dining Area",
      desc: "Intimate, conversation-starting wall sculptures.",
      link: "/products?category=wall-arts",
      image:
        "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
    },
    {
      room: "Office",
      desc: "Clean geometric symmetry for focused commercial environments.",
      link: "/products?category=wall-clocks",
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    },
    {
      room: "Entryway",
      desc: "Statement pieces making an immediate, memorable first impression.",
      link: "/products?category=designer-decor",
      image:
        "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const customerReviews = [
    {
      name: "Rohit & Meera Singhania",
      city: "Bandra, Mumbai",
      quote:
        "The sheer weight and finish of the wall clock exceeded our expectations. It looks like an architectural installation rather than a decor piece. Zero ticking sound.",
      product: "Aura Silent Wall Clock",
      photo:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Ar. Ananya Deshmukh",
      city: "Bengaluru",
      quote:
        "We specified Pavira's layered wall panels for a penthouse living room project. The precision cutting and bevel edges are exceptional. The client loved it instantly.",
      product: "Gilded Lotus 3D Wall Art",
      photo:
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Vikramaditya Rao",
      city: "Jubilee Hills, Hyderabad",
      quote:
        "Arrived in heavy wooden crating without a scratch. The matte finish and brushed gold accents reflect ambient warm lighting beautifully in the evening.",
      product: "Metallic CNC Wall Panel",
      photo:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const instagramPosts = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
      tag: "@interior_curations",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
      tag: "@studio.ahmedabad",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80",
      tag: "@modern_indian_homes",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=600&q=80",
      tag: "@pavirasignature",
    },
  ];

  return (
    <div className="bg-background text-foreground overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-28 pb-20 px-6 bg-gradient-to-b from-[#EDE8DF] via-[#F4F0E8] to-background text-center">
        {/* Mandala Geometry Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <svg
            viewBox="0 0 800 800"
            className="w-[85vw] h-[85vw] md:w-[75vw] md:h-[75vw] lg:w-[65vw] lg:h-[65vw] max-w-[1300px] max-h-[1300px] opacity-[0.15]"
            style={{ animation: "spin-slow 120s linear infinite" }}
          >
            {/* Outer ring of petals */}
            {[...Array(16)].map((_, i) => (
              <g key={`outer-${i}`} transform={`rotate(${i * 22.5} 400 400)`}>
                <ellipse cx="400" cy="150" rx="30" ry="90" fill="none" stroke="#0C3A2E" strokeWidth="1.5" />
              </g>
            ))}
            {/* Second ring */}
            {[...Array(12)].map((_, i) => (
              <g key={`mid-${i}`} transform={`rotate(${i * 30} 400 400)`}>
                <ellipse cx="400" cy="215" rx="22" ry="65" fill="none" stroke="#0C3A2E" strokeWidth="1.2" />
              </g>
            ))}
            {/* Inner ring of petals */}
            {[...Array(8)].map((_, i) => (
              <g key={`inner-${i}`} transform={`rotate(${i * 45} 400 400)`}>
                <ellipse cx="400" cy="285" rx="18" ry="50" fill="none" stroke="#0C3A2E" strokeWidth="1" />
              </g>
            ))}
            {/* Concentric circles */}
            <circle cx="400" cy="400" r="360" fill="none" stroke="#0C3A2E" strokeWidth="1" />
            <circle cx="400" cy="400" r="280" fill="none" stroke="#0C3A2E" strokeWidth="0.8" />
            <circle cx="400" cy="400" r="200" fill="none" stroke="#0C3A2E" strokeWidth="0.8" />
            <circle cx="400" cy="400" r="120" fill="none" stroke="#0C3A2E" strokeWidth="0.6" />
            {/* Innermost decorative circle */}
            <circle cx="400" cy="400" r="50" fill="none" stroke="#0C3A2E" strokeWidth="1.2" />
            {/* Diamond points on outer ring */}
            {[...Array(8)].map((_, i) => (
              <g key={`diamond-${i}`} transform={`rotate(${i * 45} 400 400)`}>
                <polygon points="400,45 408,75 400,105 392,75" fill="none" stroke="#0C3A2E" strokeWidth="1" />
              </g>
            ))}
            {/* Radiating lines */}
            {[...Array(24)].map((_, i) => (
              <line
                key={`line-${i}`}
                x1="400"
                y1="120"
                x2="400"
                y2="40"
                stroke="#0C3A2E"
                strokeWidth="0.6"
                transform={`rotate(${i * 15} 400 400)`}
              />
            ))}
          </svg>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
          <p className="text-xs md:text-sm uppercase tracking-[0.35em] mb-5 font-semibold text-[#0C3A2E]">
            THE ART OF LUXURY
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-brand font-normal text-[#1A1A1A] leading-[1.15] mb-6 tracking-tight">
            Statement Wall Décor for Beautifully Designed Spaces
          </h1>
          <p className="text-base sm:text-lg md:text-xl font-light text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            Designed in Ahmedabad · Premium Finishes · Made for Modern Interiors
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-3 bg-[#0C3A2E] text-white hover:bg-[#0C3A2E]/90 px-9 py-4 uppercase tracking-[0.2em] text-xs font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <span>EXPLORE COLLECTION</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 2. FEATURED COLLECTION (Immediately Below Hero) */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-4 border-b border-border/60 pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-2">
                Curated Selection
              </p>
              <h2 className="text-3xl md:text-4xl font-brand text-[#1A1A1A]">
                Featured Collection
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#0C3A2E] hover:text-[#D4AF37] transition-colors"
            >
              <span>View All Pieces</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingProducts ? (
              [...Array(6)].map((_, i) => <ProductSkeleton key={i} />)
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product: any) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))
            ) : (
              <p className="text-muted-foreground col-span-full py-12 text-center">
                Our latest collection is currently being updated.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY */}
      <section className="py-24 bg-[#F2EFE9] border-y border-border/60">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-2">
              Browse Collections
            </p>
            <h2 className="text-3xl md:text-4xl font-brand text-[#1A1A1A] mb-4">
              Shop by Category
            </h2>
            <p className="text-sm text-muted-foreground font-light">
              Architectural décor crafted to bring warmth, scale, and character
              to every wall.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <Link
                key={i}
                href={`/products?category=${cat.slug}`}
                className="group relative bg-white border border-border/70 overflow-hidden transition-all duration-300 hover:border-foreground/40 hover:shadow-md flex flex-col"
              >
                <div className="aspect-[4/5] relative w-full overflow-hidden bg-muted">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                </div>
                <div className="p-6 bg-white flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-lg font-serif font-medium text-[#1A1A1A] group-hover:text-[#0C3A2E] transition-colors mb-1">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-light leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0C3A2E] group-hover:text-[#D4AF37] transition-colors">
                    Explore <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE PAVIRA DIFFERENCE (Why Pavira?) */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-2">
              Our Promise
            </p>
            <h2 className="text-3xl md:text-4xl font-brand text-[#1A1A1A] mb-4">
              The Pavira Difference
            </h2>
            <p className="text-muted-foreground font-light text-sm">
              We design and build contemporary wall décor with authentic
              materials, precision manufacturing, and rigorous quality control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Designed to Impress",
                desc: "Original designs created for contemporary interiors, blending understated minimalism with bold scale.",
              },
              {
                title: "Premium Materials",
                desc: "Carefully selected materials and finishes, from structural metals to high-density composite substrates.",
              },
              {
                title: "Made With Precision",
                desc: "Every layer, edge and finish is inspected before dispatch to ensure structural integrity and flawless finish.",
              },
              {
                title: "Made for Indian Homes",
                desc: "Designed around Indian interior spaces, ceiling heights, wall sizes, lighting conditions, and lifestyles.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 border border-border/80 bg-white flex flex-col items-start text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#0C3A2E]/10 text-[#0C3A2E] flex items-center justify-center mb-6">
                  <CheckCircle2 size={20} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FROM RAW MATERIAL TO SIGNATURE PIECE (Manufacturing Process) */}
      <section className="py-24 bg-[#0C3A2E] text-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold mb-3">
              Craftsmanship & Engineering
            </p>
            <h2 className="text-3xl md:text-5xl font-brand mb-6 text-white">
              From Raw Material to Signature Piece
            </h2>
            <p className="text-white/80 font-light text-base leading-relaxed">
              Every Pavira piece is designed, cut, finished, and packaged inside
              our Ahmedabad workshop. We control the entire process from first
              cut to final dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {manufacturingSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-8 bg-white/5 border border-white/10 flex flex-col justify-between backdrop-blur-sm"
              >
                <div>
                  <span className="text-3xl font-brand text-[#D4AF37] block mb-4">
                    {step.num}
                  </span>
                  <h3 className="text-xl font-medium text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm font-light text-white/70 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SIGNATURE COLLECTION (Lifestyle Inspiration) */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative aspect-[4/3] w-full overflow-hidden bg-muted border border-border">
              <Image
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
                alt="Pavira Signature Living Room Lifestyle"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
            <div className="lg:col-span-6 flex flex-col items-start lg:pl-8">
              <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold mb-3">
                Signature Collection
              </p>
              <h2 className="text-3xl md:text-5xl font-brand text-[#1A1A1A] leading-tight mb-6">
                Proportioned for Presence and Depth
              </h2>
              <p className="text-base text-muted-foreground font-light leading-relaxed mb-6">
                Unlike thin mass-market prints, our signature pieces feature
                substantial depth (18mm – 25mm), multi-layered geometry, and
                durable powder-coated or lacquered finishes. They command the
                wall and reflect ambient light naturally throughout the day.
              </p>
              <ul className="space-y-3 mb-8 text-sm text-[#1A1A1A] font-medium">
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[#0C3A2E]" />
                  <span>Substantial architectural depth & multi-tier relief</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[#0C3A2E]" />
                  <span>Concealed heavy-duty mounting hardware included</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[#0C3A2E]" />
                  <span>Resistant to humidity and daily ambient wear</span>
                </li>
              </ul>
              <Link
                href="/products"
                className="inline-flex items-center gap-3 bg-[#0C3A2E] text-white hover:bg-[#0C3A2E]/90 px-8 py-3.5 text-xs uppercase tracking-widest font-semibold transition-colors"
              >
                View Full Collection
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MADE FOR YOUR SPACE (Shop by Room) */}
      <section className="py-24 bg-[#F2EFE9] border-t border-border/60">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-2">
              Interior Placement
            </p>
            <h2 className="text-3xl md:text-4xl font-brand text-[#1A1A1A] mb-4">
              Made for Your Space
            </h2>
            <p className="text-sm text-muted-foreground font-light">
              Explore curated recommendations tailored to the functional scale
              and atmosphere of each room.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {roomCollections.map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                className="group relative bg-white border border-border/70 overflow-hidden flex flex-col hover:border-foreground/40 transition-all duration-300"
              >
                <div className="aspect-[3/4] relative w-full overflow-hidden bg-muted">
                  <Image
                    src={item.image}
                    alt={item.room}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-lg font-serif font-medium mb-1">
                      {item.room}
                    </h3>
                    <p className="text-[11px] font-light text-white/80 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Custom Size / Consultation Callout */}
          <div className="mt-16 p-8 md:p-12 bg-white border border-border max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-brand text-[#1A1A1A] mb-3">
              Need a Custom Size or Colorway?
            </h3>
            <p className="text-muted-foreground font-light text-sm max-w-xl mx-auto mb-6">
              Our Ahmedabad studio works with homeowners to customize
              dimensions, finish tones, and frame orientations for specific
              architectural niches.
            </p>
            <Link
              href="/contact?subject=Custom Consultation"
              className="inline-flex items-center gap-2 border border-[#0C3A2E] text-[#0C3A2E] hover:bg-[#0C3A2E] hover:text-white px-7 py-3 text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              Request Custom Consultation
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. CUSTOMER REVIEWS (Loved by Design-Led Homes) */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-2">
              Verified Feedback
            </p>
            <h2 className="text-3xl md:text-4xl font-brand text-[#1A1A1A] mb-4">
              Loved by Design-Led Homes
            </h2>
            <p className="text-sm text-muted-foreground font-light">
              Trusted by homeowners, interior designers, and architects across
              India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {customerReviews.map((rev, idx) => (
              <div
                key={idx}
                className="bg-white border border-border/80 p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-[#D4AF37] mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-[#D4AF37]" />
                    ))}
                  </div>
                  <p className="text-sm text-[#1A1A1A] font-light leading-relaxed mb-6 italic">
                    "{rev.quote}"
                  </p>
                </div>
                <div className="border-t border-border/60 pt-4 mt-auto">
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    {rev.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{rev.city}</p>
                  <p className="text-[11px] text-[#0C3A2E] font-medium mt-1">
                    Verified purchase: {rev.product}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. INSTAGRAM / REAL HOMES */}
      <section className="py-20 bg-[#F2EFE9] border-t border-border/60">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-2">
                Real Installations
              </p>
              <h2 className="text-3xl font-brand text-[#1A1A1A]">
                Pavira in Real Homes
              </h2>
            </div>
            <a
              href="https://www.instagram.com/pavirasignature"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-widest font-semibold text-[#0C3A2E] hover:text-[#D4AF37] transition-colors"
            >
              Follow @pavirasignature
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {instagramPosts.map((post) => (
              <div
                key={post.id}
                className="group relative aspect-square overflow-hidden bg-muted border border-border/70"
              >
                <Image
                  src={post.image}
                  alt="Real home installation by Pavira Signature"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <span className="text-xs text-white uppercase tracking-wider font-semibold">
                    {post.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. PAVIRA FOR DESIGN PROFESSIONALS (B2B Trade Section) */}
      <section className="py-24 bg-[#0C3A2E] text-white">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-semibold mb-4">
            B2B Trade Program
          </p>
          <h2 className="text-3xl md:text-5xl font-brand mb-6 text-white">
            Pavira for Design Professionals
          </h2>
          <p className="text-base text-white/80 font-light max-w-2xl mx-auto leading-relaxed mb-10">
            We partner with architects, interior designers, and hospitality
            developers to deliver statement wall art for high-end residences,
            luxury hotels, and commercial developments.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-left max-w-4xl mx-auto mb-12">
            {[
              "Custom dimensions",
              "Multiple quantities",
              "Finish customization",
              "Project pricing",
              "Dedicated support",
            ].map((benefit, i) => (
              <div
                key={i}
                className="p-4 bg-white/5 border border-white/10 flex flex-col items-center text-center"
              >
                <CheckCircle2
                  size={18}
                  className="text-[#D4AF37] mb-2 shrink-0"
                />
                <span className="text-xs text-white/90 font-medium">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/professionals"
            className="inline-flex items-center gap-3 bg-[#D4AF37] text-[#1A1A1A] hover:bg-white px-9 py-4 uppercase tracking-[0.2em] text-xs font-bold transition-all shadow-lg"
          >
            <span>REQUEST TRADE CATALOGUE</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
