"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { productService } from "@/lib/services";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function HomeClient() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

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

  return (
    <div className="bg-background text-foreground selection:bg-accent selection:text-white overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 px-6 bg-secondary text-secondary-foreground text-center">
        {/* We would typically use a large lifestyle hero image here. 
            For now, we use a sleek typographic hero with the dark secondary background. */}
        <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
          <p className="text-xs uppercase tracking-[0.3em] mb-6 font-semibold opacity-80">
            The Art of Luxury
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-brand leading-tight mb-8">
            Statement Wall Décor for Beautifully Designed Spaces
          </h1>
          <p className="text-base md:text-lg font-light mb-12 opacity-80 max-w-2xl">
            Designed in Ahmedabad · Premium Finishes · Made for Modern Interiors
          </p>
          <Link
            href="/products"
            className="bg-accent text-accent-foreground px-8 py-4 uppercase tracking-widest text-sm font-semibold hover:bg-white hover:text-black transition-all duration-300"
          >
            Explore Collection
          </Link>
        </div>
      </section>

      {/* FEATURED COLLECTION (Products Early) */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-brand">Signature Wall Art</h2>
              <p className="text-muted-foreground mt-2 font-light">Our most coveted pieces, crafted for impact.</p>
            </div>
            <Link href="/products" className="group flex items-center gap-2 text-sm uppercase tracking-widest font-semibold hover:text-accent transition-colors">
              View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loadingProducts ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-muted animate-pulse"></div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product: any) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))
            ) : (
              <p className="text-muted-foreground col-span-full">No products available.</p>
            )}
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-brand mb-16">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {["Wall Clocks", "Wall Art", "Canvas", "Designer Décor"].map((cat, i) => (
              <Link href={`/products?category=${cat.toLowerCase()}`} key={i} className="group cursor-pointer">
                <div className="aspect-square bg-muted mb-4 overflow-hidden relative">
                   {/* Placeholder for category image */}
                   <div className="absolute inset-0 bg-secondary/5 group-hover:bg-transparent transition-colors duration-500" />
                </div>
                <h3 className="text-lg font-semibold">{cat}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* THE PAVIRA DIFFERENCE */}
      <section className="py-24 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-brand mb-4">The Pavira Difference</h2>
            <p className="font-light opacity-80 max-w-2xl mx-auto">
              Designed in Ahmedabad and finished with carefully selected materials, layered detailing, and premium surface finishes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { title: "Premium Materials", desc: "Carefully selected substrates and veneers ensuring longevity and visual weight." },
              { title: "Precision Craftsmanship", desc: "Every layer, edge, and finish is rigorously inspected before dispatch." },
              { title: "Layered Finishes", desc: "Hand-applied textures and coatings that create depth and tactile luxury." },
              { title: "Secure Packaging", desc: "Custom-fitted wooden crating guarantees your piece arrives in perfect condition." }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center">
                <CheckCircle2 className="text-accent mb-4" size={32} strokeWidth={1} />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm font-light opacity-70 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP BY ROOM */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-brand mb-16 text-center">Find Your Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { room: "Living Room", desc: "Statement pieces for your main wall." },
              { room: "Bedroom", desc: "Calm, sophisticated artwork." },
              { room: "Dining Area", desc: "Create a visual focal point." },
              { room: "Office", desc: "Modern pieces for professional spaces." },
              { room: "Entryway", desc: "Make the first impression count." }
            ].map((item, i) => (
              <div key={i} className={`group relative bg-muted overflow-hidden ${i < 2 ? 'md:col-span-1 aspect-square' : i === 2 ? 'md:col-span-1 aspect-square' : 'aspect-[16/9]'}`}>
                {/* Room Image Placeholder */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 p-8 text-white z-10">
                  <h3 className="text-2xl font-brand mb-2">{item.room}</h3>
                  <p className="font-light text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MADE FOR YOUR SPACE */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-brand mb-6">Made for Your Space</h2>
          <p className="text-lg font-light text-muted-foreground mb-10">
            We understand that every interior is unique. Whether you need custom sizes, specific color matching, or bulk requirements for commercial projects, our design team in Ahmedabad is ready to assist.
          </p>
          <Link href="/contact" className="inline-block border border-foreground text-foreground px-8 py-4 uppercase tracking-widest text-sm font-semibold hover:bg-foreground hover:text-background transition-colors">
            Request Custom Consultation
          </Link>
        </div>
      </section>

      {/* CUSTOMER REVIEWS / SOCIAL PROOF */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 text-center max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-brand mb-16">Loved by Design-Led Homes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex flex-col items-center bg-muted/10 p-8 border border-border/50">
                <div className="flex gap-1 text-accent mb-6">
                  {[...Array(5)].map((_, j) => <span key={j}>★</span>)}
                </div>
                <p className="italic text-muted-foreground mb-6 leading-relaxed">
                  "The finish looks even better in person. It completely transformed our living room wall. Exceptional quality and packaging."
                </p>
                <p className="text-sm font-semibold uppercase tracking-wider">— Verified Customer</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
