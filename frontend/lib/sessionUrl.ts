/**
 * Session URL Manager
 * Handles reading, appending, and synchronizing unique session IDs in the URL.
 * Example target: https://pavirasignature.in/?session=3cad2acc-ccb6-452d-a599-3bd5a4e84adb
 * or /session/3cad2acc-ccb6-452d-a599-3bd5a4e84adb
 */

export const SESSION_PARAM = "session";

/**
 * Validates whether a string is a standard UUID (v4)
 */
export function isValidSessionId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id.trim()
  );
}

/**
 * Extracts session ID from current URL query parameters or window location
 */
export function getSessionIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get(SESSION_PARAM) || params.get("sessionId") || params.get("sid");
    return sid && isValidSessionId(sid) ? sid : sid || null;
  } catch {
    return null;
  }
}

/**
 * Synchronizes the given sessionId into the active browser URL without triggering a full page reload.
 */
export function syncSessionToUrl(sessionId: string | null) {
  if (typeof window === "undefined" || !sessionId) return;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get(SESSION_PARAM) !== sessionId) {
      url.searchParams.set(SESSION_PARAM, sessionId);
      window.history.replaceState(window.history.state, "", url.toString());
    }
  } catch (err) {
    console.debug("[sessionUrl] Failed to sync session to URL:", err);
  }
}

/**
 * Removes session query parameter from the URL on logout.
 */
export function removeSessionFromUrl() {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    let modified = false;
    [SESSION_PARAM, "sessionId", "sid"].forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        modified = true;
      }
    });
    if (modified) {
      const search = url.searchParams.toString();
      const newUrl = url.pathname + (search ? `?${search}` : "") + url.hash;
      window.history.replaceState(window.history.state, "", newUrl);
    }
  } catch (err) {
    console.debug("[sessionUrl] Failed to remove session from URL:", err);
  }
}

/**
 * Appends the session ID to an internal href if available
 */
export function withSession(href: string, sessionId?: string | null): string {
  if (!sessionId) return href;
  if (href.startsWith("http") && !href.includes(typeof window !== "undefined" ? window.location.host : "")) {
    return href; // External link
  }
  const [baseAndPath, hash] = href.split("#");
  const [base, query] = baseAndPath.split("?");
  const params = new URLSearchParams(query || "");
  if (!params.has(SESSION_PARAM)) {
    params.set(SESSION_PARAM, sessionId);
  }
  const qs = params.toString();
  const res = qs ? `${base}?${qs}` : base;
  return hash ? `${res}#${hash}` : res;
}
