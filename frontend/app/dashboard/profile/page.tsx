'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard?tab=profile');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#1B2D20] flex items-center justify-center text-[#F5F0E6] relative overflow-hidden">
      {/* Full Page Fixed Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />

      <div className="text-center relative z-10">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold">Redirecting to your profile settings...</p>
      </div>
    </div>
  );
}
