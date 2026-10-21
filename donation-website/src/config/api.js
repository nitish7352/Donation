/**
 * Centralized API Configuration
 * 
 * Uses import.meta.env.VITE_API_BASE_URL for the backend origin.
 * In development (localhost / 127.0.0.1):
 *   Falls back to "http://localhost:5000" if VITE_API_BASE_URL is not set.
 * In production:
 *   NEVER uses http://localhost:5000 or loopback addresses.
 *   If VITE_API_BASE_URL is set, uses that deployed origin.
 *   If unset or pointing to loopback, defaults to "" (same-origin relative).
 */

export function isLocalhost() {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".local")
  );
}

export function getApiBaseUrl() {
  // Read VITE_API_BASE_URL (or VITE_API_URL as secondary fallback)
  const envUrl = (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    ""
  ).trim();

  const onLocal = isLocalhost();

  // In production builds or when running on public domain (like Vercel):
  if (!onLocal || import.meta.env.PROD) {
    if (envUrl) {
      const isLoopback =
        envUrl.includes("localhost") ||
        envUrl.includes("127.0.0.1") ||
        envUrl.includes("0.0.0.0");
      if (!isLoopback) {
        let clean = envUrl.replace(/\/+$/, "");
        if (clean.endsWith("/api")) clean = clean.slice(0, -4);
        return clean;
      }
    }
    // Deployed domain fallback: use same-origin relative path /api
    return "";
  }

  // In local development on localhost/127.0.0.1:
  if (envUrl) {
    let clean = envUrl.replace(/\/+$/, "");
    if (clean.endsWith("/api")) clean = clean.slice(0, -4);
    return clean;
  }

  return "http://localhost:5000";
}

export const API_BASE_URL = getApiBaseUrl();

// Full /api endpoint prefix
export const API = API_BASE_URL ? `${API_BASE_URL}/api` : "/api";

export default API;
