"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Factory, Hammer, Award, Compass } from "lucide-react";

const craftsmanshipSteps = [
  {
    phase: "01",
    title: "Design",
    description:
      "Original silhouettes drafted in our Ahmedabad studio, proportioned specifically for modern Indian living spaces and architectural wall sizes.",
  },
  {
    phase: "02",
    title: "Precision Cutting",
    description:
      "Industrial-grade fiber laser and CNC routers achieve micro-millimeter edge accuracy across metal and high-density panels.",
  },
  {
    phase: "03",
    title: "Layering",
    description:
      "Multiple precision-cut tiers are assembled to create architectural 3D relief, casting natural ambient shadows without visual clutter.",
  },
  {
    phase: "04",
    title: "Finishing",
    description:
      "Multi-stage anti-corrosion priming followed by hand-rubbed matte textures, antique golds, and deep forest hues.",
  },
  {
    phase: "05",
    title: "Quality Check",
    description:
      "Every layer, bevel edge, mounting point, and surface coat undergoes a rigorous inspection before packaging sign-off.",
  },
  {
    phase: "06",
    title: "Packed & Delivered",
    description:
      "Secured in custom shock-absorbing packaging and reinforced wooden crating to guarantee zero-damage delivery anywhere in India.",
  },
];

export default function AboutClient() {
  return (
    <main className="bg-background text-foreground overflow-hidden pt-24">
      {/* 1. Hero Section */}
      <section className="py-24 md:py-32 bg-[#F2EFE9] text-center px-6 border-b border-border/60">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.35em] mb-5 font-semibold text-[#0C3A2E]">
            Our Story
          </p>
          <h1 className="text-4xl md:text-6xl font-brand text-[#1A1A1A] leading-tight mb-8">
            Designed for Modern Spaces,<br />Crafted in Ahmedabad
          </h1>
          <p className="text-lg md:text-xl font-light text-[#1A1A1A]/80 max-w-3xl mx-auto leading-relaxed">
            Born in Ahmedabad, Pavira Signature brings together design, precision
            manufacturing and skilled finishing to create contemporary wall décor
            for modern Indian spaces.
          </p>
        </div>
      </section>

      {/* 2. Prominent Section: DESIGNED & CRAFTED IN AHMEDABAD */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">
                Brand Heritage
              </p>
              <h2 className="text-3xl md:text-5xl font-brand text-[#1A1A1A] leading-tight">
                DESIGNED & CRAFTED IN AHMEDABAD
              </h2>
              <p className="text-base text-muted-foreground font-light leading-relaxed">
                Ahmedabad has long been one of India’s great centers of industrial
                engineering, textile design, and architectural innovation. We
                draw upon this rich ecosystem of precision manufacturing and
                craftsmanship to build decor that meets commercial durability
                standards.
              </p>
              <p className="text-base text-muted-foreground font-light leading-relaxed">
                Rather than importing generic flat-pack prints or fragile resin
                castings, our pieces are manufactured in-house. We select
                high-grade aluminum, anti-corrosive alloys, and dense composite
                substrates that withstand variable climates and humidity across
                Indian cities.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/80">
                <div>
                  <h4 className="font-semibold text-lg text-[#1A1A1A]">In-House Studio</h4>
                  <p className="text-xs text-muted-foreground font-light mt-1">
                    Design drafting, prototypes, and material testing in Kathwada, Ahmedabad.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-[#1A1A1A]">Commercial Grade</h4>
                  <p className="text-xs text-muted-foreground font-light mt-1">
                    Fabricated for luxury residences, hotels, and corporate offices.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative aspect-[4/3] w-full overflow-hidden bg-muted border border-border">
              <Image
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80"
                alt="Precision engineering and manufacturing in Ahmedabad workshop"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Manufacturing Process: From Raw Material to Signature Piece */}
      <section className="py-24 bg-[#0C3A2E] text-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold mb-3">
              Direct In-House Control
            </p>
            <h2 className="text-3xl md:text-5xl font-brand mb-6 text-white">
              From Raw Material to Signature Piece
            </h2>
            <p className="text-white/80 font-light text-base leading-relaxed">
              By owning the full fabrication cycle in Ahmedabad, we eliminate
              middlemen and maintain uncompromising standards from raw stock to
              final crating.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {craftsmanshipSteps.map((step, index) => (
              <div
                key={index}
                className="p-8 bg-white/5 border border-white/10 flex flex-col justify-between backdrop-blur-sm"
              >
                <div>
                  <span className="text-3xl font-brand text-[#D4AF37] block mb-4">
                    {step.phase}
                  </span>
                  <h3 className="text-xl font-medium text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm font-light text-white/70 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why Pavira Signature */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-2">
              Values & Standards
            </p>
            <h2 className="text-3xl md:text-4xl font-brand text-[#1A1A1A]">
              Why Pavira Signature?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Designed to Impress",
                desc: "Original designs created for contemporary interiors, striking a balance between scale and refinement.",
              },
              {
                title: "Premium Materials",
                desc: "Carefully selected substrates, anti-corrosive hardware, and multi-stage lacquer finishes.",
              },
              {
                title: "Made With Precision",
                desc: "Every layer, edge and finish is inspected before dispatch to guarantee zero manufacturing flaws.",
              },
              {
                title: "Made for Indian Homes",
                desc: "Designed around Indian interior spaces, wall sizes, lighting orientations, and lifestyles.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 border border-border/80 bg-white flex flex-col items-start text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#0C3A2E]/10 text-[#0C3A2E] flex items-center justify-center mb-6">
                  <CheckCircle2 size={20} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Call to Action */}
      <section className="py-24 bg-[#F2EFE9] text-center px-6 border-t border-border/60">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-brand text-[#1A1A1A] mb-4">
            Discover Statement Décor for Your Space
          </h2>
          <p className="text-muted-foreground font-light text-sm mb-8">
            Browse our collection of architectural clocks, layered metal wall art,
            and contemporary decor.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#0C3A2E] text-white uppercase tracking-widest text-xs font-semibold hover:bg-[#0C3A2E]/90 transition-colors"
          >
            Explore Collection
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
