// src/utils/auth.js
export const AUTH_TOKEN_KEY = "authToken";

export function saveTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    params.delete("token");
    const newUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
    window.history.replaceState({}, "", newUrl);
    return token;
  }
  return null;
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem("role");
  localStorage.removeItem("seller");
  localStorage.removeItem("sellerId");
}
