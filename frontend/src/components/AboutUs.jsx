import React from "react";
import "./AboutUs.css";

export default function AboutUs() {
  return (
    <div className="about-container">
      <div className="about-hero">
        <h1>About Us</h1>
        <p>Your trusted partner in growing your business</p>
      </div>

      <div className="about-section">
        <h2>🌟 Who We Are</h2>
        <p>
          We are a passionate team dedicated to empowering sellers and helping 
          them succeed in the competitive e-commerce marketplace. Our platform 
          provides seamless tools for order management, payments, shipping, and 
          growth so you can focus on what matters most – your customers.
        </p>
      </div>

      <div className="about-section">
        <h2>🚀 Our Mission</h2>
        <p>
          To create a simple yet powerful ecosystem where sellers can thrive, 
          scale their business, and connect with millions of buyers effortlessly. 
          We believe in transparency, innovation, and long-term partnerships.
        </p>
      </div>

      <div className="about-section">
        <h2>🤝 Why Choose Us</h2>
        <ul>
          <li>✔ Easy-to-use seller dashboard</li>
          <li>✔ Transparent payment system</li>
          <li>✔ Real-time order tracking</li>
          <li>✔ Dedicated support team</li>
        </ul>
      </div>

      <div className="about-footer">
        <p>📞 Need help? Contact us at <b>support@shienstore.com</b></p>
      </div>
    </div>
  );
}
