import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md mx-auto">
        <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold mb-3 block">
          404 Error
        </span>
        <h1 className="text-4xl md:text-5xl font-brand text-[#1A1A1A] mb-4">
          Page Not Found
        </h1>
        <p className="text-muted-foreground font-light text-sm mb-8 leading-relaxed">
          The page or product you are seeking may have been moved, updated, or is no longer available.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-7 py-3.5 bg-[#0C3A2E] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#0C3A2E]/90 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={14} />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto px-7 py-3.5 border border-[#0C3A2E] text-[#0C3A2E] text-xs uppercase tracking-widest font-semibold hover:bg-[#0C3A2E] hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <span>Explore Collections</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}
