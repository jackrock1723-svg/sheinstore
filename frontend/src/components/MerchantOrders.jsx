import React, { useEffect, useState } from "react";
import { saveTokenFromUrl, getSellerToken } from "../utils/auth";
import axios from "axios";
import OrderCard from "./OrderCard";
import ChatModal from "./ChatModal";
import "./merchant.css";
import api from "../utils/api";

export default function MerchantOrders() {
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    // ✅ read injected Shopify customer data
    if (window.shopifySeller) {
      setSeller(window.shopifySeller);
    } 
  }, []);
  
  useEffect(() => {
    saveTokenFromUrl(); // extract token from URL (if present) and store
}, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!seller) return; // wait until seller detected
      if (!seller.tags.includes("seller")) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/shopify/products/random`
        );
        setProducts(res.data);
      } catch (err) {
        console.error("❌ fetch products error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [seller]);

  const handleRequest = (product) => {
    setActiveProduct(product);
  };

  const onConfirmed = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  if (!seller) {
    return <div>Loading seller info...</div>;
  }

  if (!seller.tags.includes("seller")) {
    return <div>🚫 You are not authorized to view this page.</div>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>
        Welcome {seller.name} — Merchant Products
      </h1>

      {loading ? (
        <div>Loading products...</div>
      ) : products.length === 0 ? (
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
              onRequest={() => handleRequest(product)}
            />
          ))}
        </div>
      )}

      <ChatModal
        open={!!activeProduct}
        onClose={() => setActiveProduct(null)}
        order={activeProduct}
        onConfirmed={onConfirmed}
      />
    </div>
  );
}
