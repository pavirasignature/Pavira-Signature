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

    const backendToken = (session as any).accessToken;
    const user = {
      id: (session.user as any).id || (session.user as any)._id || null,
      email: session.user.email || "",
      name: session.user.name || "",
      firstName: (session.user as any).firstName || "",
      lastName: (session.user as any).lastName || "",
      image: session.user.image || "",
      googleId: (session.user as any).googleId || null,
    };

    if (backendToken) {
      setToken(backendToken);
    }
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

