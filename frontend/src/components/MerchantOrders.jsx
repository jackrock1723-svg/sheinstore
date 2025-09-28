import React, { useEffect, useState } from "react";
import { saveTokenFromUrl, getSellerToken, getAuthToken } from "../utils/auth";
import api from "../utils/api";
import OrderCard from "./OrderCard";
import ChatModal from "./ChatModal";
import "./merchant.css";

export default function MerchantOrders() {
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null); // ✅ for ChatModal
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState(null);

  // Save token if passed in URL
  useEffect(() => {
    saveTokenFromUrl();
  }, []);

  // ✅ Fetch seller info from backend using token
  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.get("/api/seller/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSeller(res.data); // seller object returned from backend
      } catch (err) {
        console.error("❌ fetch seller error", err);
        localStorage.removeItem("sellerToken");
      } finally {
        setLoading(false);
      }
    };

    fetchSeller();
  }, []);

  // ✅ Fetch products (only ONCE, not every render)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/shopify/products/random");
        setProducts(res.data);
      } catch (err) {
        console.error("❌ fetch products error", err);
      }
    };

    if (seller) fetchProducts();
  }, [seller]); // ✅ only run when seller is available

  // when "Request Shipment" clicked
  const handleRequest = (product) => {
    console.log("📦 Selected product:", product);
    setActiveProduct(product); // ✅ opens ChatModal
  };

  const onConfirmed = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  // --- UI states ---
  if (loading) return <div>Loading seller info...</div>;
  if (!seller) return <div>🚫 Please log in as a seller to continue.</div>;

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>
        Welcome {seller.name} — Merchant Products
      </h1>

      {products.length === 0 ? (
        <div>No products available</div>
      ) : (
        <div className="merchant-grid">
          {products.map((product) => (
            <OrderCard
              key={product.id}
              order={{
                _id: product.id,
                productName: product.title,
                price: product.variants?.[0]?.price || "N/A",
                quantity: product.variants?.[0]?.inventory_quantity || "N/A",
                status: "available",
                createdAt: product.created_at,
                image: product.image?.src,
              }}
              onRequest={() => handleRequest(product)} // ✅ opens chat
            />
          ))}
        </div>
      )}

      {/* ✅ Chat modal opens only when activeProduct is set */}
      <ChatModal
        open={!!activeProduct}
        onClose={() => setActiveProduct(null)}
        order={activeProduct}
        onConfirmed={onConfirmed}
      />
    </div>
  );
}
