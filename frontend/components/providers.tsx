"use client";

import dynamic from "next/dynamic";
import { useEffect, Suspense } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useStore } from "@/store/useStore";
import SessionUrlSync from "./SessionUrlSync";
import { syncSessionToUrl } from "@/lib/sessionUrl";

const ToastContainer = dynamic(
  () => import("./Toast").then((m) => ({ default: m.ToastContainer })),
  { ssr: false }
);

function AuthSync() {
  const { data: session, status } = useSession();
  const { setUser, setToken, setSessionId } = useStore();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      return;
    }

    if (typeof window !== "undefined") {
      // If the user explicitly logged out, do NOT re-sync the NextAuth session.
      // This prevents the bug where navigating away from /login and back
      // causes automatic re-login from a stale NextAuth cookie.
      const hasLoggedOut = sessionStorage.getItem("loggedOut");
      if (hasLoggedOut === "true") {
        return;
      }

      const currentMethod = sessionStorage.getItem("loginMethod");
      if (currentMethod === "credentials") {
        // Do not overwrite custom credentials (like admin) with NextAuth session on tab switch
        return;
      }
    }

    const backendToken = (session as any).accessToken;
    if (!backendToken) {
      console.warn(
        "[AuthSync] NextAuth session is authenticated but no backend accessToken was found. " +
        "The user may appear logged in but API calls will fail. " +
        "Check the jwt callback in [...nextauth].ts for backend sync errors."
      );
      return;
    }

    const sessionUser = session.user as any;
    const resolvedSessionId = sessionUser.sessionId || (session as any).sessionId || null;
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
      sessionId: resolvedSessionId,
      addresses: sessionUser.addresses || [],
    };

    if (typeof window !== "undefined") {
      // Only show the "Access Granted" popup on a fresh login, not on every page refresh.
      // If the token is already stored, the user is resuming an existing session.
      const existingToken = sessionStorage.getItem("token");
      if (!existingToken || existingToken !== backendToken) {
        sessionStorage.setItem("showAccessGrantedAlert", "true");
      }
      sessionStorage.setItem("loginMethod", "google");

      if (resolvedSessionId) {
        syncSessionToUrl(resolvedSessionId);
      }
    }
    setToken(backendToken);
    setUser(user);
    if (resolvedSessionId) {
      setSessionId(resolvedSessionId);
    }
  }, [session, status, setToken, setUser, setSessionId]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthSync />
      <Suspense fallback={null}>
        <SessionUrlSync />
      </Suspense>
      {children}
      <ToastContainer />
    </SessionProvider>
  );
}
