import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedSellerRoute({ children }) {
  const token = localStorage.getItem("sellerToken");

  if (!token) {
    return <Navigate to="/seller/login" replace />;
  }

  return children;
}
