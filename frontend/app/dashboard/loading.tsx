export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F9F6F0] selection:bg-[#0C3A2E] selection:text-white">
      <div className="h-20 bg-white border-b border-[#1A1A1A]/10" />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-12">
        {/* Profile card skeleton */}
        <div className="bg-white border border-[#1A1A1A]/10 p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#F9F6F0] animate-pulse" />
            <div className="space-y-3">
              <div className="h-6 w-48 bg-[#F9F6F0] animate-pulse" />
              <div className="h-4 w-32 bg-[#F9F6F0] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Order list skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-[#1A1A1A]/10 p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-5 w-36 bg-[#F9F6F0] animate-pulse" />
                  <div className="h-3 w-24 bg-[#F9F6F0] animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-[#F9F6F0] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
