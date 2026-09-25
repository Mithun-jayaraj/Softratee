import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./home.css";
const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("white");
  const navigate = useNavigate();
  const tshirtImages = {
    white: "/images/products/tshirt-white.png",
    black: "/images/products/tshirt-black.png",
    gray: "/images/products/tshirt-gray.png",
    orange: "/images/products/tshirt-orange.png",
    brown: "/images/products/tshirt-brown.png",
  };
  const heroColors = [
    { name: "White", id: "white", hex: "#FFFFFF" },
    { name: "Black", id: "black", hex: "#111111" },
    { name: "Light Gray", id: "gray", hex: "#D9D9D9" },
    { name: "Rust/Orange", id: "orange", hex: "#B85C3A" },
    { name: "Dark Brown", id: "brown", hex: "#4A3B32" },
  ];
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading store...
      </div>
    );
  }
  const categoryTiles = [
    {
      name: "Men",
      link: "/products?category=Men",
      bg: "/images/categories/men.jpg",
    },
    {
      name: "Women",
      link: "/products?category=Women",
      bg: "/images/categories/women.jpg",
    },
    {
      name: "Kids",
      link: "/products?category=Kids",
      bg: "/images/categories/kids.jpg",
    },
  ];
  const latestProducts = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-overline">
            <span>YOUR STYLE. YOUR T-SHIRT.</span>
            <div className="hero-overline-line"></div>
          </div>
          <h1>
            Design a T-Shirt
            <br />
            That's Yours
          </h1>
          <p>
            Choose your color, add your design, and create something you'll
            actually want to wear.
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn-hero-primary">
              Start Customizing &rarr;
            </Link>
            <Link to="/products" className="btn-hero-secondary">
              Shop T-Shirts
            </Link>
          </div>
          <div className="hero-features">
            <div className="feature-item">
              <div className="feature-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </div>
              <div className="feature-text">
                <strong>Easy Customization</strong>
                <span>Bring your ideas to life</span>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <div className="feature-text">
                <strong>Fast Delivery</strong>
                <span>At your doorstep</span>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div className="feature-text">
                <strong>Secure Payment</strong>
                <span>Shop with confidence</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <img
            src={tshirtImages[selectedColor]}
            alt={`${selectedColor} T-shirt`}
            className="main-hero-img"
          />
          <div className="clean-floating-card">
            <span className="clean-floating-title">T-Shirt Colors</span>
            <div className="clean-floating-colors">
              {heroColors.map((color) => (
                <button
                  key={color.id}
                  className={`cfc-dot ${selectedColor === color.id ? "active" : ""}`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Select ${color.name} T-shirt`}
                  onClick={() => setSelectedColor(color.id)}
                />
              ))}
            </div>
            <span className="clean-floating-helper">
              Click a color to change the T-shirt
            </span>
          </div>
        </div>
      </section>
      <section className="section-container" id="categories">
        <div className="section-header-center">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">
            Find the perfect style for every occasion.
          </p>
        </div>
        <div className="category-grid">
          {categoryTiles.map((cat, index) => (
            <Link
              key={index}
              to={cat.link}
              className="category-card"
              style={{ backgroundImage: `url(${cat.bg})` }}
            >
              <div className="category-card-panel">
                <span className="category-name">{cat.name}</span>
                <span className="category-arrow">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="section-container">
        <div className="section-header-center">
          <h2 className="section-title">Latest T-Shirts</h2>
        </div>
        <div className="product-grid">
          {latestProducts.map((product) => (
            <div key={product._id} className="product-card">
              <Link
                to={`/product/${product._id}`}
                className="product-image-container"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/products/product_fallback.jpg";
                  }}
                />
              </Link>
              <div className="product-info">
                <Link to={`/product/${product._id}`} className="product-name">
                  {product.name}
                </Link>
                <div className="product-price">₹{product.price.toFixed(2)}</div>
                <Link
                  to={`/product/${product._id}`}
                  className="btn-view-product"
                >
                  View Product
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="customization-section" id="customizer">
        <div className="section-container">
          <h2 className="section-title">Design It Your Way</h2>
          <div className="flow-container">
            <div className="flow-steps">
              <div className="flow-step">
                <div className="step-number">1</div>
                <div>Choose T-shirt</div>
              </div>
              <div className="flow-step">
                <div className="step-number">2</div>
                <div>Add text or design</div>
              </div>
              <div className="flow-step">
                <div className="step-number">3</div>
                <div>Adjust the design</div>
              </div>
              <div className="flow-step">
                <div className="step-number">4</div>
                <div>Preview</div>
              </div>
              <div className="flow-step">
                <div className="step-number">5</div>
                <div>Add to Cart</div>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Link to="/products" className="btn-hero-primary">
                Try It Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
