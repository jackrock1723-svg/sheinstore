// src/utils/api.js
import axios from "axios";
import { getSellerToken, clearSellerToken } from "./auth";

const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = getSellerToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (err) => Promise.reject(err));

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearSellerToken();
      window.location.href = "/"; // redirect if token expired
    }
    return Promise.reject(error);
  }
);

export default api;
