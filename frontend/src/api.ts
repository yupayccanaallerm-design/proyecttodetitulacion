export const API_BASE = "";

const TOKEN_KEYS = ["admin_token", "access_token", "token"];

function clearAuthStorage() {
  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem("user_id");
  localStorage.removeItem("admin_name");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_role");
}

export function getAuthToken(): string | null {
  return TOKEN_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) || null;
}

export function setAuthToken(token: string) {
  TOKEN_KEYS.forEach((key) => localStorage.setItem(key, token));
  sessionStorage.setItem("admin_session_active", "1");
}

export function clearAuthToken() {
  clearAuthStorage();
  sessionStorage.removeItem("admin_session_active");
}

export function isAdminSessionActive() {
  return Boolean(sessionStorage.getItem("admin_session_active") && getAuthToken());
}

export function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();
  const merged: RequestInit = {
    ...options,
    headers: {
      ...(options.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  return fetch(url, merged);
}
