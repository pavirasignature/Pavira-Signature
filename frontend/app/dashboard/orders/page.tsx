'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrdersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard?tab=orders');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center text-[#1A1A1A] selection:bg-[#0C3A2E] selection:text-white">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#0C3A2E] border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="text-xs uppercase tracking-widest font-semibold text-[#1A1A1A]/60">Redirecting to orders...</p>
      </div>
    </div>
  );
}
