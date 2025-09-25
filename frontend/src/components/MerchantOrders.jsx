import React, { useEffect, useState } from "react";
import { saveTokenFromUrl, getSellerToken } from "../utils/auth";
import api from "../utils/api";
import OrderCard from "./OrderCard";
import ChatModal from "./ChatModal";
import "./merchant.css";

export default function MerchantOrders() {
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
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
        const token = getSellerToken();
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

  // ✅ Fetch products only after seller info is loaded
  useEffect(() => {
    const fetchProducts = async () => {
      if (!seller) return;

      setLoading(true);
      try {
        const res = await api.get("/api/shopify/products/random");
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
                quantity:
                  product.variants?.[0]?.inventory_quantity || "N/A",
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



// import React, { useEffect, useState } from "react";
// import { saveTokenFromUrl, getSellerToken } from "../utils/auth";
// import axios from "axios";
// import OrderCard from "./OrderCard";
// import ChatModal from "./ChatModal";
// import "./merchant.css";
// import api from "../utils/api";

// export default function MerchantOrders() {
//   const [products, setProducts] = useState([]);
//   const [activeProduct, setActiveProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [seller, setSeller] = useState(null);

//   useEffect(() => {
//     // ✅ read injected Shopify customer data
//     if (window.shopifySeller) {
//       setSeller(window.shopifySeller);
//     } 
//   }, []);
//   useEffect(() => {
//   const params = new URLSearchParams(window.location.search);
//   const token = params.get("token");
//   if (token) {
//     localStorage.setItem("sellerToken", token);
//     window.history.replaceState({}, document.title, "/merchant"); 
//   }
// }, []);
  
//   useEffect(() => {
//     saveTokenFromUrl(); // extract token from URL (if present) and store
// }, []);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       if (!seller) return; // wait until seller detected
//       if (!seller.tags.includes("seller")) {
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       try {
//         const res = await api.get(
//           `${process.env.REACT_APP_BACKEND_URL}/api/shopify/products/random`
//         );
//         setProducts(res.data);
//       } catch (err) {
//         console.error("❌ fetch products error", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProducts();
//   }, [seller]);

//   const handleRequest = (product) => {
//     setActiveProduct(product);
//   };

//   const onConfirmed = (updatedProduct) => {
//     setProducts((prev) =>
//       prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
//     );
//   };

//   if (!seller) {
//     return <div>Loading seller info...</div>;
//   }

//   if (!seller.tags.includes("seller")) {
//     return <div>🚫 You are not authorized to view this page.</div>;
//   }

//   return (
//     <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
//       <h1 style={{ textAlign: "center", marginBottom: 20 }}>
//         Welcome {seller.name} — Merchant Products
//       </h1>

//       {loading ? (
//         <div>Loading products...</div>
//       ) : products.length === 0 ? (
//         <div>No products available</div>
//       ) : (
//         <div className="merchant-grid">
//           {products.map((product) => (
//             <OrderCard
//               key={product.id}
//               order={{
//                 _id: product.id,
//                 productName: product.title,
//                 price: product.variants?.[0]?.price || "N/A",
//                 quantity: product.variants?.[0]?.inventory_quantity || "N/A",
//                 status: "available",
//                 createdAt: product.created_at,
//                 image: product.image?.src,
//               }}
//               onRequest={() => handleRequest(product)}
//             />
//           ))}
//         </div>
//       )}

//       <ChatModal
//         open={!!activeProduct}
//         onClose={() => setActiveProduct(null)}
//         order={activeProduct}
//         onConfirmed={onConfirmed}
//       />
//     </div>
//   );
// }
