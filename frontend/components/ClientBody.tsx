"use client";

import dynamic from "next/dynamic";
import { Providers } from "@/components/providers";

const SmoothScroll = dynamic(() => import("@/components/SmoothScroll"), {
  ssr: false,
  loading: () => <></>,
});

export default function ClientBody({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <Providers>{children}</Providers>
    </>
  );
}
