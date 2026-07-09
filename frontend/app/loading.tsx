export default function Loading() {
  return (
    <div className="min-h-screen bg-[#1B2D20] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo pulse */}
        <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/30 flex items-center justify-center animate-pulse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#68BA7F] to-[#D4AF37] animate-spin" 
               style={{ animationDuration: '1.5s' }} />
        </div>
        <div className="text-[#D4AF37]/60 text-sm font-semibold tracking-widest uppercase animate-pulse">
          Loading
        </div>
      </div>
    </div>
  );
}
