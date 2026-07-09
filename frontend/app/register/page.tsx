"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/signup");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#1B2D20] text-[#F5F0E6] flex items-center justify-center relative overflow-hidden">
      {/* Full Page Fixed Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />

      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D4AF37] border-t-transparent relative z-10" />
    </div>
  );
}
