import React, { useState } from "react";
import "./Dashboard.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
  Home,
  Grid,
  Search,
  ShoppingCart,
  UserCircle,
} from "lucide-react";



const Dashboard = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const sellerName = "John Doe"; // Replace with dynamic seller name
  const navigate = useNavigate();

  const features = [
    { icon: User, title: "Merchant",path: "/merchant" },
    { icon: ShoppingBag, title: "Orders" },
    { icon: Wallet, title: "Wallet" },
    { icon: MapPin, title: "Address" },
    { icon: Package, title: "Products" },
    { icon: Settings, title: "Settings" },
    { icon: Info, title: "About Us" },
    { icon: Download, title: "App Download" },
  ];

  const products = [
    { title: "Premium Jacket", price: "$59.99", img: "/images/p1.png" },
    { title: "Casual Sneakers", price: "$45.00", img: "/images/p2.png" },
    { title: "Classic Watch", price: "$120.00", img: "/images/p3.png" },
    { title: "Leather Bag", price: "$89.00", img: "/images/p4.png" },
    { title: "Sunglasses", price: "$35.00", img: "/images/p5.png" },
    { title: "Headphones", price: "$75.00", img: "/images/p6.png" },
  ];

  return (
    <div className="dashboard-container">
      {/* Black Banner */}
      <header className="dashboard-top" role="banner">
        <div className="top-left">
          {/* Avatar with initials */}
          <div className="avatar-placeholder">IN</div>

          <div className="seller-info">
            <h2 className="seller-name">{sellerName}</h2>
            <p className="status">
              <CheckCircle size={14} /> <span className="status-text">Verified Seller</span>
            </p>
          </div>
        </div>

        <div className="top-right" aria-haspopup="true">
          {/* Profile svg icon (click opens dropdown) */}
          <button
            className="profile-icon-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Profile menu"
          >
            <UserCircle size={28} className="profile-icon-svg" />
          </button>

          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="dropdown-menu"
            >
              <button className="dd-item"><User size={16} /> <span>My Profile</span></button>
              <hr />
              <button className="dd-item"
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
      {/* Coupon Section */}
      <section className="coupon-section">
        <div className="coupon-card">
          <div>
            <h3>Coupon</h3>
            <p>Collect coupons and save on your orders</p>
          </div>
          <button className="claim-btn">Claim</button>
        </div>
      </section>

      {/* content wrapper */}
      <main className="content-wrapper">
        {/* Features Grid */}
        <section className="features-section" aria-label="Quick actions">
          {features.map((f, i) => (
            <motion.div whileHover={{ scale: 1.03 }} key={i} className="feature-card" role="button" onClick={() => navigate(f.path)}>
              <f.icon size={28} />
              <p className="feature-title">{f.title}</p>
            </motion.div>
          ))}
        </section>

        {/* Products */}
        <section className="products-section" aria-label="Featured products">
          <h2>Featured Products</h2>
          <div className="products-grid">
            {products.map((p, i) => (
              <motion.div whileHover={{ scale: 1.03 }} key={i} className="product-card">
                <img src={p.img} alt={p.title} />
                <h3>{p.title}</h3>
                <p className="price">{p.price}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer (Desktop only) */}
      <footer className="dashboard-footer" role="contentinfo">
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

      {/* Bottom Nav (mobile only) */}
      <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
        <div className="nav-item"><Home size={20} /><span>Home</span></div>
        <div className="nav-item"><Grid size={20} /><span>Category</span></div>
        <div className="nav-item"><Search size={20} /><span>Find</span></div>
        <div className="nav-item"><ShoppingCart size={20} /><span>Cart</span></div>
        <div className="nav-item"><UserCircle size={20} /><span>My</span></div>
      </nav>
    </div>
  );
};

export default Dashboard;
