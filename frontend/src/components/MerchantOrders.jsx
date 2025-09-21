import React, { useEffect, useState } from "react";
import axios from "axios";
import OrderCard from "./OrderCard";
import ChatModal from "./ChatModal";
import "./merchant.css";

export default function MerchantOrders() {
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/shopify/products/random");
        setProducts(res.data);
      } catch (err) {
        console.error("❌ fetch products error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleRequest = (product) => {
    setActiveProduct(product);
  };

  const onConfirmed = (updatedProduct) => {
    // You can extend this when order/shipment flow is added
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>Merchant — Products</h1>

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
