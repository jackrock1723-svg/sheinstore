// src/utils/auth.js
export const SELLER_TOKEN_KEY = "sellerToken";

export function saveTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    localStorage.setItem(SELLER_TOKEN_KEY, token);
    // remove token from URL
    params.delete("token");
    const newUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
    window.history.replaceState({}, "", newUrl);
    return token;
  }
  return null;
}

export function getSellerToken() {
  return localStorage.getItem(SELLER_TOKEN_KEY);
}

export function clearSellerToken() {
  localStorage.removeItem(SELLER_TOKEN_KEY);
}
