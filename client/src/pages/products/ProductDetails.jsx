import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import "./products.css";

const PREDEFINED_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Red', hex: '#EF2222' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Green', hex: '#15803D' }
];

const ProductDetails = () => {
  const { user } = React.useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
        
        const existingColors = data.colors || [];
        const mergedColors = PREDEFINED_COLORS.map(pc => {
          const found = existingColors.find(ec => ec.name.toLowerCase() === pc.name.toLowerCase());
          return found ? { ...pc, image: found.image || '' } : { ...pc, image: '' };
        });
        
        setSelectedColor(mergedColors[0]);
        setLoading(false);
      } catch (err) {
        setError("Product not found");
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);
  const addToCartHandler = () => {
    navigate(
      `/cart/${id}?qty=${qty}&size=${selectedSize}&color=${selectedColor ? encodeURIComponent(selectedColor.name) : ""}`,
    );
  };
  const customizeHandler = () => {
    navigate(
      `/customizer/${id}?qty=${qty}&size=${selectedSize}&color=${selectedColor ? encodeURIComponent(selectedColor.name) : ""}`,
    );
  };
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  const availableColors = PREDEFINED_COLORS.map(pc => {
    const found = product?.colors?.find(c => c.name.toLowerCase() === pc.name.toLowerCase());
    return found ? { ...pc, image: found.image || '' } : { ...pc, image: '' };
  });

  return (
    <div className="product-details-page">
      <Link className="btn btn-light my-3" to="/products">
        Go Back
      </Link>
      <div className="details-container">
        <div className="details-image">
          <img src={selectedColor?.image || product.image} alt={product.name} />
        </div>
        <div className="details-info">
          <h3>{product.name}</h3>
          <p className="price">₹{product.price.toFixed(2)}</p>
          <p className="description">{product.description}</p>
          {product.countInStock > 0 && (
            <div className="options">
              {product.sizes?.length > 0 && (
                <div className="option-group">
                  <label>Size:</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    {product.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {availableColors.length > 0 && (
                <div className="option-group">
                  <label>Color:</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {availableColors.map((colorObj) => {
                      const isSelected = selectedColor?.name === colorObj.name;
                      return (
                        <button
                          key={colorObj.name}
                          type="button"
                          onClick={() => setSelectedColor(colorObj)}
                          title={colorObj.name}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: colorObj.hex,
                            border: '2px solid var(--color-white)',
                            outline: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            boxShadow: isSelected ? '0 0 0 2px var(--color-text)' : '0 0 0 1px var(--color-border)'
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="option-group">
                <label>Qty:</label>
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                >
                  {[...Array(product.countInStock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <div className="action-buttons">
            {!user?.isAdmin && (
              <button
                className="btn btn-dark"
                disabled={product.countInStock === 0}
                onClick={addToCartHandler}
              >
                Add to Cart
              </button>
            )}
            {product.isCustomizable && product.countInStock > 0 && (
              <button
                className="btn btn-primary ml-2"
                onClick={customizeHandler}
              >
                Customize Design
              </button>
            )}
          </div>
          {product.countInStock === 0 && (
            <p className="text-danger">Out of Stock</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductDetails;
