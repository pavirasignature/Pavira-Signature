"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import { getStoredSessionId } from "@/lib/authStorage";
import { syncSessionToUrl, removeSessionFromUrl, SESSION_PARAM, isValidSessionId } from "@/lib/sessionUrl";

export default function SessionUrlSync() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionId = useStore((state) => state.sessionId);
  const user = useStore((state) => state.user);
  const setSessionId = useStore((state) => state.setSessionId);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Do not alter URLs on static asset or API requests
    if (pathname?.startsWith("/api") || pathname?.startsWith("/_next")) return;

    // 1. If URL has a session ID but store doesn't have it, hydrate store
    const urlSession = searchParams?.get(SESSION_PARAM) || searchParams?.get("sessionId") || searchParams?.get("sid");
    if (urlSession && (!sessionId || sessionId !== urlSession)) {
      setSessionId(urlSession);
    }

    // 2. If user is authenticated and has a sessionId, ensure it is in the URL
    const activeSessionId = sessionId || user?.sessionId || getStoredSessionId();
    if (activeSessionId && user) {
      syncSessionToUrl(activeSessionId);
    } else if (!user && !activeSessionId && (searchParams?.has(SESSION_PARAM) || searchParams?.has("sessionId") || searchParams?.has("sid"))) {
      // If user is completely logged out and no active user exists, clear session from URL
      removeSessionFromUrl();
    }
  }, [pathname, searchParams, sessionId, user, setSessionId]);

  return null;
}
