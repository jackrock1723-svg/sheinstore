import React, { useState } from "react";
import "./Dashboard.css";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Wallet,
  MapPin,
  Settings,
  Info,
  Download,
  Package,
  User,
  LogOut,
  CheckCircle,
} from "lucide-react";

const Dashboard = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const sellerName = "John Doe"; // Replace with dynamic seller name

  const features = [
    { icon: ShoppingBag, title: "Orders" },
    { icon: Wallet, title: "Wallet" },
    { icon: MapPin, title: "Address" },
    { icon: Package, title: "Products" },
    { icon: Settings, title: "Settings" },
    { icon: Info, title: "About Us" },
    { icon: Download, title: "App Download" },
  ];

  const products = [
    { title: "Premium Jacket", price: "$59.99", img: "https://source.unsplash.com/300x400/?jacket" },
    { title: "Casual Sneakers", price: "$45.00", img: "https://source.unsplash.com/300x400/?sneakers" },
    { title: "Classic Watch", price: "$120.00", img: "https://source.unsplash.com/300x400/?watch" },
    { title: "Leather Bag", price: "$89.00", img: "https://source.unsplash.com/300x400/?bag" },
    { title: "Sunglasses", price: "$35.00", img: "https://source.unsplash.com/300x400/?sunglasses" },
    { title: "Headphones", price: "$75.00", img: "https://source.unsplash.com/300x400/?headphones" },
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo">SHEIN</div>
        <div className="seller-name">{sellerName}</div>
        <div className="profile-section">
          <span className="verified">
            <CheckCircle size={16} /> Verified Seller
          </span>
          <div
            className="profile-avatar"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            IN
          </div>

          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="dropdown-menu"
            >
              <button><User size={16}/> My Profile</button>
              <button
  onClick={() => {
    localStorage.removeItem("sellerToken");
    window.location.href = "/seller/login"; // redirect to login
  }}
>
  <LogOut size={16}/> Logout
</button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="dashboard-hero">
        <div className="hero-content">
          <h1>Welcome back, {sellerName}!</h1>
          <p>Manage your store, track orders, and grow your sales.</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="features-section">
        {features.map((f, i) => (
          <motion.div whileHover={{ scale: 1.05 }} key={i} className="feature-card">
            <f.icon size={30} />
            <p>{f.title}</p>
          </motion.div>
        ))}
      </section>

      {/* Products */}
      <section className="products-section">
        <h2>Featured Products</h2>
        <div className="products-grid">
          {products.map((p, i) => (
            <motion.div whileHover={{ scale: 1.05 }} key={i} className="product-card">
              <img src={p.img} alt={p.title} />
              <h3>{p.title}</h3>
              <p>{p.price}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-columns">
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li>Shop All</li>
              <li>About Us</li>
              <li>Contact</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div>
            <h4>Collections</h4>
            <ul>
              <li>Men's Collection</li>
              <li>Women's Collection</li>
              <li>New Arrivals</li>
            </ul>
          </div>
          <div>
            <h4>Customer Service</h4>
            <ul>
              <li>Returns & Exchanges</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
          <div>
            <h4>Stay Connected</h4>
            <div className="socials">
              <span>F</span>
              <span>I</span>
              <span>T</span>
            </div>
          </div>
        </div>
        <p>© 2025 SHEIN, Powered by Shopify</p>
      </footer>
    </div>
  );
};

export default Dashboard;
