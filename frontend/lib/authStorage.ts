/**
 * Auth Storage Utility
 * Manages Session vs Persistent Auth based on "Remember Me".
 */

const isBrowser = typeof window !== "undefined";
const SESSION_COOKIE_NAME = "pavira_session_active";

function getCookie(name: string): string | null {
  if (!isBrowser) return null;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function setCookie(name: string, value: string, maxAgeSeconds?: number) {
  if (!isBrowser) return;
  const isSecure = window.location.protocol === "https:";
  let cookieStr = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
  if (maxAgeSeconds !== undefined) {
    cookieStr += `; max-age=${maxAgeSeconds}`;
  }
  if (isSecure) {
    cookieStr += "; Secure";
  }
  document.cookie = cookieStr;
}

function deleteCookie(name: string) {
  if (!isBrowser) return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function isRememberMeActive(): boolean {
  if (!isBrowser) return false;
  return localStorage.getItem("rememberMe") === "true";
}

export function getStoredAuth(): { token: string | null; user: any | null } {
  if (!isBrowser) return { token: null, user: null };

  const isRemembered = localStorage.getItem("rememberMe") === "true";

  if (isRemembered) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    let user = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (_) {}
    }

    if (token) {
      // Sync to sessionStorage so current tab has fast access
      sessionStorage.setItem("token", token);
      if (userStr) sessionStorage.setItem("user", userStr);
      sessionStorage.setItem("rememberMe", "true");
      return { token, user };
    }
  }

  // When Remember Me was NOT checked:
  // Must have an active browser session cookie
  const hasSessionCookie = Boolean(getCookie(SESSION_COOKIE_NAME));
  const token = sessionStorage.getItem("token");
  const userStr = sessionStorage.getItem("user");

  // If token is found in sessionStorage AND browser session cookie is alive:
  if (token && hasSessionCookie) {
    let user = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (_) {}
    }
    return { token, user };
  }

  // If token was in sessionStorage but browser was restarted (session cookie lost),
  // purge any restored/orphaned sessionStorage so user is logged out on restart:
  if (token && !hasSessionCookie) {
    clearStoredAuth();
  }

  return { token: null, user: null };
}

export function saveStoredAuth(token: string, user: any, rememberMe: boolean = false) {
  if (!isBrowser) return;

  const userStr = JSON.stringify(user);

  if (rememberMe) {
    localStorage.setItem("rememberMe", "true");
    localStorage.setItem("token", token);
    localStorage.setItem("user", userStr);
    sessionStorage.setItem("rememberMe", "true");
    // Persistent cookie for 30 days
    setCookie(SESSION_COOKIE_NAME, "1", 30 * 24 * 60 * 60);
  } else {
    // Pure session storage — wipe from persistent storage completely
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.setItem("rememberMe", "false");
    // Pure session cookie: NO max-age -> browser purges when closed
    setCookie(SESSION_COOKIE_NAME, "1");
  }

  sessionStorage.setItem("token", token);
  sessionStorage.setItem("user", userStr);
  sessionStorage.removeItem("loggedOut");
}

export function clearStoredAuth() {
  if (!isBrowser) return;

  deleteCookie(SESSION_COOKIE_NAME);
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("rememberMe");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("loginMethod");
  sessionStorage.setItem("loggedOut", "true");
}
