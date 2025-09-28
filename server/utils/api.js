// src/utils/api.js
import axios from "axios";
import { getSellerToken, clearSellerToken } from "./auth";

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false // we use Bearer tokens; change if using cookies
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = getSellerToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (err) => Promise.reject(err));

// Global response interceptor: handle 401 (token expired)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      // token invalid/expired: clear and reload or redirect to a safe page
      clearSellerToken();
      // optional: redirect to login or show message
      window.location.href = "/"; // or another route
    }
    return Promise.reject(error);
  }
);

export default api;
