"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const craftsmanshipSteps = [
  {
    phase: "01",
    title: "Design",
    description: "Original designs drafted in our Ahmedabad studio, tailored for contemporary interior spaces."
  },
  {
    phase: "02",
    title: "Precision Cutting",
    description: "State-of-the-art CNC and laser cutting ensures every geometric detail is perfectly translated from design to material."
  },
  {
    phase: "03",
    title: "Layering",
    description: "Multiple layers of premium MDF, acrylic, or metal are meticulously assembled to create depth and structural integrity."
  },
  {
    phase: "04",
    title: "Finishing",
    description: "Hand-applied textures and premium surface coatings give each piece its final, sophisticated look."
  },
  {
    phase: "05",
    title: "Quality Check",
    description: "Every layer, edge, and finish is rigorously inspected before dispatch to ensure it meets our standards."
  },
  {
    phase: "06",
    title: "Packed & Delivered",
    description: "Secured in custom packaging to ensure it arrives at your home in pristine condition."
  }
];

export default function AboutClient() {
  return (
    <main className="bg-background text-foreground overflow-hidden pt-24">
      
      {/* 1. Hero Section */}
      <section className="py-24 md:py-32 bg-secondary text-secondary-foreground text-center px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] mb-6 font-semibold opacity-80">
            Our Story
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-brand leading-tight mb-8">
            From Ahmedabad,<br />Made for Modern Spaces
          </h1>
          <p className="text-lg md:text-xl font-light opacity-80 max-w-2xl mx-auto leading-relaxed">
            "Every masterpiece begins as a whisper of inspiration."
          </p>
        </div>
      </section>

      {/* 2. Brand Philosophy */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-brand mb-10 leading-snug">
            Designed for Indian Homes
          </h2>
          <div className="space-y-6 text-muted-foreground font-light text-lg leading-relaxed text-left md:text-center">
            <p>
              Pavira Signature was created with a simple idea: wall décor should feel like part of the architecture, not something added at the end.
            </p>
            <p>
              Born in Ahmedabad, we bring together contemporary design, precision manufacturing, and skilled hand-finishing to create statement wall décor designed specifically around Indian interior spaces, wall sizes, and lifestyles.
            </p>
            <p>
              We believe luxury shouldn't cost the earth. We focus on what matters: high-quality substrates, careful finishing, and original designs that make your walls unforgettable.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Manufacturing Process */}
      <section className="py-24 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-brand mb-6">From Raw Material to Signature Piece</h2>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto">
              We proudly manufacture our products in-house. This gives us complete control over quality, from the first cut to the final coat of paint.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {craftsmanshipSteps.map((step, index) => (
              <div key={index} className="flex flex-col relative group">
                <span className="text-5xl font-brand text-muted-foreground/20 absolute -top-6 -left-4 z-0 group-hover:text-accent/20 transition-colors duration-500">
                  {step.phase}
                </span>
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground font-light text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why Pavira */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-brand mb-6">Why Pavira Signature?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Designed to Impress", desc: "Original designs created for contemporary interiors." },
              { title: "Premium Materials", desc: "Carefully selected materials and finishes." },
              { title: "Made With Precision", desc: "Every layer, edge, and finish is inspected before dispatch." },
              { title: "Made for Indian Homes", desc: "Designed around Indian interior spaces, wall sizes, and lifestyles." }
            ].map((feature, i) => (
              <div key={i} className="p-8 border border-border flex flex-col items-center text-center hover:border-accent transition-colors duration-300">
                <CheckCircle2 className="text-accent mb-6" size={32} strokeWidth={1} />
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="py-32 bg-secondary text-secondary-foreground text-center px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-brand mb-8">Ready to transform your walls?</h2>
          <Link 
            href="/products"
            className="inline-flex items-center gap-3 px-8 py-4 bg-background text-foreground uppercase tracking-widest text-sm font-semibold hover:bg-accent hover:text-background transition-colors duration-300"
          >
            Explore Collection
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </main>
  );
}
