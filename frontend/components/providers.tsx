"use client";

import dynamic from "next/dynamic";

const ToastContainer = dynamic(
  () => import("./Toast").then((m) => ({ default: m.ToastContainer })),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}

