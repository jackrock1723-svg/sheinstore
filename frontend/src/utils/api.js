// src/utils/api.js
import axios from "axios";
import { getAuthToken, clearAuthToken } from "./auth";

const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (err) => Promise.reject(err));

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuthToken();
      window.location.href = "/seller/login"; // redirect if token expired
    }
    return Promise.reject(error);
  }
);

export default api;
