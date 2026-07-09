export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#1B2D20]">
      <div className="h-20 bg-[#1A2E20]/80 border-b border-white/5" />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-12">
        {/* Profile card skeleton */}
        <div className="bg-[#1A2E20] border border-[#2A4734] rounded-xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#2A4734] animate-pulse" />
            <div className="space-y-3">
              <div className="h-6 w-48 bg-[#2A4734] rounded animate-pulse" />
              <div className="h-4 w-32 bg-[#2A4734]/60 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Order list skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#1A2E20] border border-[#2A4734] rounded-xl p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-5 w-36 bg-[#2A4734] rounded animate-pulse" />
                  <div className="h-3 w-24 bg-[#2A4734]/60 rounded animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-[#2A4734] rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
