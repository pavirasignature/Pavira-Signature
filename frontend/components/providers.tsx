"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useStore } from "@/store/useStore";

const ToastContainer = dynamic(
  () => import("./Toast").then((m) => ({ default: m.ToastContainer })),
  { ssr: false }
);

function AuthSync() {
  const { data: session, status } = useSession();
  const { setUser, setToken } = useStore();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      return;
    }

    if (typeof window !== "undefined") {
      const currentMethod = sessionStorage.getItem("loginMethod");
      if (currentMethod === "credentials") {
        // Do not overwrite custom credentials (like admin) with NextAuth session on tab switch
        return;
      }
    }

    const backendToken = (session as any).accessToken;
    if (!backendToken) {
      return;
    }

    const sessionUser = session.user as any;
    const user = {
      id: sessionUser.id || sessionUser._id || null,
      email: session.user.email || "",
      name: session.user.name || "",
      firstName: sessionUser.firstName || "",
      lastName: sessionUser.lastName || "",
      image: session.user.image || sessionUser.picture || "",
      googleId: sessionUser.googleId || null,
      role: sessionUser.role || "customer",
      phone: sessionUser.phone || "",
      addresses: sessionUser.addresses || [],
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("showAccessGrantedAlert", "true");
      sessionStorage.setItem("loginMethod", "google");
    }
    setToken(backendToken);
    setUser(user);
  }, [session, status, setToken, setUser]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthSync />
      {children}
      <ToastContainer />
    </SessionProvider>
  );
}
