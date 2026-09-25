import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import "./products.css";
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
        if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
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
              {product.colors?.length > 0 && (
                <div className="option-group">
                  <label>Color:</label>
                  <select
                    value={selectedColor?.name || ""}
                    onChange={(e) =>
                      setSelectedColor(
                        product.colors.find((c) => c.name === e.target.value),
                      )
                    }
                  >
                    {product.colors.map((colorObj) => (
                      <option key={colorObj.name} value={colorObj.name}>
                        {colorObj.name}
                      </option>
                    ))}
                  </select>
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
