"use client";

import React from "react";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import { usePathname } from "next/navigation";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
