
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-[#0B3B2E] text-[#F8F7F3] overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,36,29,0.4)_0%,rgba(11,59,46,1)_100%)] z-0 pointer-events-none" />

      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4B06A]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="text-center relative z-10">
          {/* 404 Number */}
          <h1
            className="text-[10rem] md:text-[14rem] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 select-none"
          >
            404
          </h1>

          {/* Message */}
          <div className="-mt-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-white/60 max-w-md mx-auto mb-10 text-lg">
              The page you are looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="px-8 py-4 bg-[#D4B06A] text-[#0B3B2E] font-semibold tracking-wide rounded-sm transition-all hover:bg-[#E6C78B] flex items-center gap-2"
            >
              Back to Home
            </Link>
            <Link
              href="/products"
              className="px-8 py-4 border border-white/20 text-white font-semibold tracking-wide rounded-sm hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
