import React, { useState, useEffect } from "react";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [products, setProducts] = useState([]);

  // Fetch products from backend
  useEffect(() => {
    fetch("/api/chat/products") // proxy → backend on 5000
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  // Handle sending message
const sendMessage = async () => {
  if (!input.trim()) return;
  const newMsg = { sender: "user", text: input };
  setMessages([...messages, newMsg]);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
  } catch (err) {
    console.error("Chat error:", err);
    setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Something went wrong." }]);
  }

  setInput("");
};


  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}>
      <h2>💬 Seller Chat</h2>
      <div style={{ height: "300px", overflowY: "auto", border: "1px solid #eee", padding: "10px" }}>
        {messages.map((msg, i) => (
          <p key={i} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
            <strong>{msg.sender}:</strong> {msg.text}
          </p>
        ))}
      </div>
      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ width: "80%", padding: "5px" }}
        />
        <button onClick={sendMessage} style={{ padding: "5px 10px", marginLeft: "5px" }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
