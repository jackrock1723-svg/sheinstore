import React, { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import "./chatmodal.css";

export default function ChatModal({ open, onClose, order, onConfirmed }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // ✅ fetch sellerId from localStorage
  const sellerId = localStorage.getItem("sellerId");

  useEffect(() => {
    if (open && order) {
      setMessages([
        {
          from: "bot",
          text: "👋 Hi! I’m your shipment assistant. You can ask me about products, payments, or shipments.",
        },
        { from: "bot", text: `📦 Order: ${order.productName || order.title}` },
        {
          from: "bot",
          text: `💰 Price: ₹${order.price || order.variants?.[0]?.price}`,
        },
        {
          from: "bot",
          text: `🪙 You will earn: ₹${(
            (order.price || order.variants?.[0]?.price || 0) * 0.2
          ).toFixed(2)}`,
        },
      ]);
    }
  }, [open, order]);

  const addBot = (text) => setMessages((m) => [...m, { from: "bot", text }]);
  const addUser = (text) => setMessages((m) => [...m, { from: "user", text }]);

  const UPI_ID = "pray551999@ibl"; // ⚡ Replace with real merchant UPI

  // --- send message logic ---
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    addUser(userMessage);
    setInput("");

    try {
      const lower = userMessage.toLowerCase();

      if (lower.includes("product")) {
        const res = await api.get("/api/shopify/products/random");
        const items = res.data || [];
        if (items.length) {
          addBot("Here are some product suggestions:");
          items.slice(0, 3).forEach((p) => {
            const price = p.variants?.[0]?.price || "N/A";
            const earn = (price * 0.2).toFixed(2);
            addBot(`🛍️ ${p.title} | ₹${price} | Earn: ₹${earn}`);
          });
        } else {
          addBot("No products found right now.");
        }
        return;
      }

      if (
        lower.includes("upi") ||
        lower.includes("payment") ||
        lower.includes("pay")
      ) {
        addBot(`💳 You can pay via UPI: **${UPI_ID}**`);
        addBot("📤 After payment, please upload your screenshot here.");
        return;
      }

      // default → send to AI
      const ai = await api.post("/api/chat", { message: userMessage });
      addBot(ai.data.reply);
    } catch (err) {
      console.error("chat error", err);
      addBot("⚠️ Something went wrong. Try again.");
    }
  };

  // --- handle proof upload ---
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!sellerId) {
      addBot("⚠️ Seller ID missing. Please log in again.");
      return;
    }

    setUploading(true);
    addUser("📤 Uploaded payment screenshot.");

    try {
      const form = new FormData();
      form.append("screenshot", file); // ✅ must match backend
      form.append("sellerId", sellerId); // ✅ ensure sellerId is included
      form.append("productId", order?.id || order?._id || "");
      form.append("productTitle", order?.title || order?.productName);
      form.append("price", order?.variants?.[0]?.price || order?.price || 0);
      form.append(
        "earn",
        ((order?.variants?.[0]?.price || order?.price || 0) * 0.2).toFixed(2)
      );

      const res = await api.post("/api/shipment/request", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      addBot(
        "✅ Payment screenshot uploaded successfully. Waiting for admin verification..."
      );
      if (onConfirmed) onConfirmed(res.data.order);
    } catch (err) {
      console.error("upload error", err.response?.data || err.message);
      addBot("⚠️ Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="chatmodal-overlay">
      <div className="chatmodal">
        <div className="chat-header">
          <h3>SHEIN Support 🤖</h3>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        <div className="chat-body">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`chat-msg ${m.from === "bot" ? "bot" : "user"}`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="chat-footer">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
          />
          <button onClick={handleSend}>Send</button>
          <input
            type="file"
            ref={fileRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleFile}
          />
          <button onClick={() => fileRef.current.click()} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Proof"}
          </button>
        </div>
      </div>
    </div>
  );
}
