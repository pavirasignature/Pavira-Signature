export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-[#1B2D20]">
      {/* Header skeleton */}
      <div className="h-20 bg-[#1A2E20]/80 border-b border-white/5" />

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-28 pb-12">
        {/* Title skeleton */}
        <div className="mb-12">
          <div className="h-10 w-64 bg-[#2A4734] rounded-lg animate-pulse mb-3" />
          <div className="h-4 w-40 bg-[#2A4734]/60 rounded animate-pulse" />
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-[#1A2E20] border border-[#2A4734] rounded-xl overflow-hidden">
              <div className="aspect-square bg-[#2A4734]/40 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-20 bg-[#2A4734] rounded animate-pulse" />
                <div className="h-5 w-3/4 bg-[#2A4734] rounded animate-pulse" />
                <div className="h-3 w-24 bg-[#2A4734]/60 rounded animate-pulse" />
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <div className="h-6 w-20 bg-[#2A4734] rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
