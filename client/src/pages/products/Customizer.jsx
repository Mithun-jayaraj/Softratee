import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import "./customizer.css";
const defaultColors = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#111111" },
  { name: "Light Grey", hex: "#D9D9D9" },
  { name: "Navy", hex: "#1F2937" },
  { name: "Red", hex: "#C94B3C" },
  { name: "Royal Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#3F5F4A" },
  { name: "Beige", hex: "#D8C3A5" },
  { name: "Brown", hex: "#7A4A2E" },
];
const Customizer = () => {
  const { user } = React.useContext(AuthContext);
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState(searchParams.get("size") || "");
  const [selectedColor, setSelectedColor] = useState(null);
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [textSize, setTextSize] = useState(24);
  const [textPosX, setTextPosX] = useState(50);
  const [textPosY, setTextPosY] = useState(30);
  const [customImage, setCustomImage] = useState(null);
  const [imageSize, setImageSize] = useState(100);
  const [imagePosX, setImagePosX] = useState(50);
  const [imagePosY, setImagePosY] = useState(50);
  const [showPreview, setShowPreview] = useState(false);
  useEffect(() => {
    const fetchProductAndDesigns = async () => {
      try {
        const { data: productData } = await api.get(`/products/${id}`);
        setProduct(productData);
        if (!size && productData.sizes?.length > 0)
          setSize(productData.sizes[0]);
        if (!selectedColor) {
          const colorsToUse =
            productData.colors?.length > 0 ? productData.colors : defaultColors;
          const initialColorParam = searchParams.get("color");
          const matchedColor = colorsToUse.find(
            (c) => c.name === initialColorParam || c.hex === initialColorParam,
          );
          setSelectedColor(matchedColor || colorsToUse[0]);
        }
        const { data: designsData } = await api.get("/designs");
        setDesigns(designsData);
        setLoading(false);
      } catch (err) {
        alert("Failed to load data");
        setLoading(false);
      }
    };
    fetchProductAndDesigns();
  }, [id, size, selectedColor, searchParams]);
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleAddToCart = () => {
    if (!size) {
      alert("Please select a size before adding to cart.");
      return;
    }
    const customConfig = {
      text,
      textColor,
      textSize,
      textPosX,
      textPosY,
      hasCustomImage: !!customImage,
      imageSize,
      imagePosX,
      imagePosY,
    };
    const configStr = encodeURIComponent(JSON.stringify(customConfig));
    navigate(
      `/cart/${id}?qty=1&size=${size}&color=${encodeURIComponent(selectedColor?.name || "")}&custom=${configStr}`,
    );
  };
  if (loading)
    return <div className="customizer-loading">Loading product...</div>;
  const availableColors =
    product?.colors?.length > 0 ? product.colors : defaultColors;
  const getProductImage = (baseImage, color) => {
    if (!color) return baseImage;
    if (baseImage?.includes("hero_model")) {
      const name = color.name.toLowerCase();
      if (name.includes("white")) return "/images/products/tshirt-white.png";
      if (name.includes("black")) return "/images/products/tshirt-black.png";
      if (name.includes("grey") || name.includes("gray"))
        return "/images/products/tshirt-gray.png";
      if (name.includes("orange") || name.includes("rust"))
        return "/images/products/tshirt-orange.png";
      if (name.includes("brown")) return "/images/products/tshirt-brown.png";
      return `/images/products/tshirt-${name.replace(/\s+/g, "-")}.png`;
    }
    return baseImage;
  };
  return (
    <div className="customizer-page">
      <div className="customizer-container">
        <div className="preview-area">
          <div className="tshirt-mockup">
            <div className="mockup-inner">
              {product ? (
                <div className="customizer-image-container">
                  <img
                    src={getProductImage(product.image, selectedColor)}
                    alt={product.name}
                    className="product-base-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = product.image;
                    }}
                  />
                </div>
              ) : (
                <div className="no-image-placeholder">
                  No product image available
                </div>
              )}
              <div className="design-area">
                {customImage && (
                  <img
                    src={customImage}
                    alt="Custom Design"
                    className="overlay-image"
                    style={{
                      width: `${imageSize}px`,
                      left: `${imagePosX}%`,
                      top: `${imagePosY}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                )}
                {text && (
                  <div
                    className="overlay-text"
                    style={{
                      color: textColor,
                      fontSize: `${textSize}px`,
                      left: `${textPosX}%`,
                      top: `${textPosY}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {text}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="product-thumbnails">
            {availableColors.map((c, i) => (
              <div
                key={i}
                className={`thumbnail-wrapper ${selectedColor?.hex === c.hex ? "selected" : ""}`}
                onClick={() => setSelectedColor(c)}
              >
                <div
                  className="thumbnail-placeholder"
                  style={{ backgroundColor: "#f9fafb", position: "relative" }}
                >
                  <img
                    src={getProductImage(product.image, c)}
                    className="thumbnail-image"
                    alt={`${c.name} variant`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = product.image;
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="controls-area">
          <div className="control-header">
            <div className="title-price-row">
              <h2>Customize Your T-Shirt</h2>
              <h2 className="price-tag">₹{product?.price?.toFixed(2)}</h2>
            </div>
            <h3 className="product-title">{product?.name}</h3>
            <p className="product-desc">
              High quality cotton t-shirt, perfect for your own design.
            </p>
          </div>
          <hr className="divider" />
          <div className="control-section">
            <label className="section-label">Color</label>
            <div className="color-picker-container">
              {availableColors.map((c) => (
                <div
                  key={c.hex}
                  className={`color-swatch-wrapper ${selectedColor?.hex === c.hex ? "selected" : ""}`}
                  onClick={() => setSelectedColor(c)}
                >
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="control-section">
            <div className="label-row">
              <label className="section-label">Size</label>
            </div>
            <div className="size-selector">
              {product?.sizes?.map((s) => (
                <button
                  key={s}
                  className={`size-btn ${size === s ? "selected" : ""}`}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="control-section">
            <label className="section-label">Add Text (Optional)</label>
            <div className="form-group">
              <input
                type="text"
                className="clean-input"
                placeholder="Enter your text"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div className="two-col-grid mt-3">
              <div className="grid-col">
                <label className="section-label">Text Color</label>
                <div className="text-color-swatches">
                  {[
                    "#000000",
                    "#ffffff",
                    "#ef4444",
                    "#3b82f6",
                    "#10b981",
                    "#eab308",
                    "#f97316",
                    "#8b5cf6",
                  ].map((c) => (
                    <div
                      key={c}
                      className={`text-color-circle ${textColor === c ? "selected" : ""}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setTextColor(c)}
                    />
                  ))}
                </div>
              </div>
              <div className="grid-col">
                <label className="section-label">Text Size</label>
                <div className="slider-row">
                  <input
                    type="range"
                    className="clean-slider"
                    min="12"
                    max="72"
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                  />
                  <span className="slider-value">{textSize}px</span>
                </div>
              </div>
            </div>
            {text && (
              <div className="position-controls mt-3">
                <div className="slider-row">
                  <span className="slider-label">X</span>
                  <input
                    type="range"
                    className="clean-slider"
                    min="0"
                    max="100"
                    value={textPosX}
                    onChange={(e) => setTextPosX(Number(e.target.value))}
                  />
                </div>
                <div className="slider-row">
                  <span className="slider-label">Y</span>
                  <input
                    type="range"
                    className="clean-slider"
                    min="0"
                    max="100"
                    value={textPosY}
                    onChange={(e) => setTextPosY(Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="control-section">
            <div className="two-col-grid">
              <div className="grid-col">
                <label className="section-label">Add Design (Optional)</label>
                <div className="file-upload-row">
                  <label className="file-upload-btn">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                  <span className="file-name">
                    {customImage ? "Image Selected" : "No file chosen"}
                  </span>
                </div>
                <p className="upload-hint">
                  Supported formats: PNG, JPG (Max 2MB)
                </p>
              </div>
              <div className="grid-col">
                <label className="section-label">Image Size</label>
                <div className="slider-row">
                  <input
                    type="range"
                    className="clean-slider"
                    min="30"
                    max="300"
                    value={imageSize}
                    onChange={(e) => setImageSize(Number(e.target.value))}
                  />
                </div>
                <label className="section-label mt-2">Image Position</label>
                <div className="slider-row">
                  <span className="slider-label">X</span>
                  <input
                    type="range"
                    className="clean-slider"
                    min="0"
                    max="100"
                    value={imagePosX}
                    onChange={(e) => setImagePosX(Number(e.target.value))}
                  />
                </div>
                <div className="slider-row">
                  <span className="slider-label">Y</span>
                  <input
                    type="range"
                    className="clean-slider"
                    min="0"
                    max="100"
                    value={imagePosY}
                    onChange={(e) => setImagePosY(Number(e.target.value))}
                  />
                </div>
                {customImage && (
                  <button
                    className="btn-link mt-1 text-red"
                    onClick={() => setCustomImage(null)}
                  >
                    🗑️ Remove Design
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="action-buttons mt-3">
            <button
              className="btn-secondary"
              onClick={() => setShowPreview(true)}
            >
              👁️ Preview
            </button>
            {!user?.isAdmin && (
              <button className="btn-primary-dark" onClick={handleAddToCart}>
                🛒 Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
      {showPreview && (
        <div
          className="preview-modal-backdrop"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="preview-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="preview-modal-header">
              <h3>Preview Customization</h3>
              <button
                className="close-btn"
                onClick={() => setShowPreview(false)}
              >
                ×
              </button>
            </div>
            <div className="preview-modal-body">
              <div className="preview-modal-image-wrapper">
                {product ? (
                  <div
                    className="preview-image-container"
                    style={{ position: "relative" }}
                  >
                    <img
                      src={getProductImage(product.image, selectedColor)}
                      alt="Preview"
                      className="preview-base-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = product.image;
                      }}
                    />
                  </div>
                ) : (
                  <div className="no-image-placeholder">No image</div>
                )}
                <div className="preview-design-area">
                  {customImage && (
                    <img
                      src={customImage}
                      alt="Custom Design"
                      className="overlay-image"
                      style={{
                        width: `${imageSize}px`,
                        left: `${imagePosX}%`,
                        top: `${imagePosY}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  )}
                  {text && (
                    <div
                      className="overlay-text"
                      style={{
                        color: textColor,
                        fontSize: `${textSize}px`,
                        left: `${textPosX}%`,
                        top: `${textPosY}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {text}
                    </div>
                  )}
                </div>
              </div>
              <div className="preview-modal-details-grid">
                <div className="detail-row">
                  <span className="detail-label">Product:</span>
                  <span className="detail-value">{product?.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Color:</span>
                  <span className="detail-value flex-align">
                    <span
                      className="preview-color-dot"
                      style={{ backgroundColor: selectedColor?.hex }}
                    ></span>
                    {selectedColor?.name}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Size:</span>
                  <span className="detail-value">{size || "Not selected"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Text:</span>
                  <span className="detail-value">{text || "—"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Design:</span>
                  <span className="detail-value">
                    {customImage ? "Custom Design" : "—"}
                  </span>
                </div>
                <div className="detail-row mt-2">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value price-value">
                    ₹{product?.price?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="preview-modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowPreview(false)}
              >
                Edit
              </button>
              {!user?.isAdmin && (
                <button className="btn-primary-dark" onClick={handleAddToCart}>
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Customizer;
