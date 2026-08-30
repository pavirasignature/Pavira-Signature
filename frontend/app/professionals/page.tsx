import { Metadata } from "next";
import Link from "next/link";
import PublicLayout from "@/components/layout/PublicLayout";
import { ArrowRight, Building2, Dimensions, DraftingCompass, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "For Professionals | Pavira Signature B2B",
  description: "Exclusive trade benefits, custom sizing, and project pricing for architects, interior designers, and commercial projects by Pavira Signature.",
  alternates: {
    canonical: "https://pavirasignature.in/professionals",
  }
};

export default function ProfessionalsPage() {
  return (
    <PublicLayout>
      <main className="bg-background text-foreground pt-24 min-h-screen">
        
        {/* Hero Section */}
        <section className="py-24 md:py-32 bg-secondary text-secondary-foreground text-center px-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] mb-6 font-semibold opacity-80">
              B2B Trade Program
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-brand leading-tight mb-8">
              Pavira for Design Professionals
            </h1>
            <p className="text-lg md:text-xl font-light opacity-80 max-w-2xl mx-auto leading-relaxed mb-10">
              Designed for Projects. We partner with architects, interior designers, and commercial developers to create statement pieces for premium spaces.
            </p>
            <Link 
              href="/contact?subject=Trade Catalogue Request"
              className="inline-flex items-center gap-3 px-8 py-4 bg-background text-foreground uppercase tracking-widest text-sm font-semibold hover:bg-accent hover:text-background transition-colors duration-300"
            >
              Request Trade Catalogue
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-background border-b border-border/50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-brand">Trade Program Benefits</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  icon: Building2, 
                  title: "Project Pricing", 
                  desc: "Exclusive trade discounts and tiered pricing for bulk commercial orders and ongoing hospitality projects." 
                },
                { 
                  icon: DraftingCompass, // Replaced Maximize with DraftingCompass which is a standard lucide-react icon
                  title: "Custom Dimensions", 
                  desc: "Scale our signature designs to fit massive feature walls or specific architectural niches perfectly." 
                },
                { 
                  icon: Users, 
                  title: "Dedicated Support", 
                  desc: "Direct access to our art advisory team for palette matching, finish customization, and project coordination." 
                },
                { 
                  icon: ArrowRight, 
                  title: "Priority Production", 
                  desc: "Expedited manufacturing timelines and priority shipping for time-sensitive commercial installations." 
                }
              ].map((benefit, i) => (
                <div key={i} className="p-8 border border-border text-center flex flex-col items-center hover:border-accent transition-colors duration-300">
                  <benefit.icon className="text-accent mb-6" size={32} strokeWidth={1.5} />
                  <h3 className="font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Process */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <h2 className="text-3xl font-brand mb-8">Join the Trade Program</h2>
            <p className="text-muted-foreground font-light mb-12">
              To apply for a trade account and receive our B2B catalogue, please send an email to <strong className="text-foreground">connect@pavirasignature.in</strong> with your company details, GST certificate (if applicable), and website/portfolio link.
            </p>
            <Link 
              href="mailto:connect@pavirasignature.in?subject=Trade Account Application"
              className="inline-block border border-foreground text-foreground px-8 py-4 uppercase tracking-widest text-sm font-semibold hover:bg-foreground hover:text-background transition-colors"
            >
              Apply via Email
            </Link>
          </div>
        </section>

      </main>
    </PublicLayout>
  );
}
