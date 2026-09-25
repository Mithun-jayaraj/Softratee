import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './admin.css';
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
    } else {
      fetchProducts();
    }
  }, [user, navigate]);
  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
      setLoading(false);
    }
  };
  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };
  const createProductHandler = async () => {
    try {
      const { data } = await api.post('/products', {});
      navigate(`/admin/product/${data._id}/edit`);
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    }
  };
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Products</h2>
        <button onClick={createProductHandler} className="btn btn-primary">
          Create Product
        </button>
      </div>
      <div className="table-wrapper">
        <table className="table admin-products-table">
        <thead>
          <tr>
            <th>IMAGE</th>
            <th>NAME</th>
            <th>CATEGORY</th>
            <th>STOCK</th>
            <th>PRICE</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>
                <img src={product.image} alt={product.name} className="table-img" />
              </td>
              <td style={{ fontWeight: 500 }}>{product.name}</td>
              <td>{product.category?.name || product.category}</td>
              <td>
                <span className={`badge ${product.countInStock > 0 ? 'badge-success' : 'badge-error'}`}>
                  {product.countInStock > 0 ? `${product.countInStock} In Stock` : 'Out of Stock'}
                </span>
              </td>
              <td>₹{product.price.toFixed(2)}</td>
              <td className="table-actions">
                <Link to={`/admin/product/${product._id}/edit`} className="btn btn-light">
                  Edit
                </Link>
                <button
                  onClick={() => deleteHandler(product._id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};
export default Products;
