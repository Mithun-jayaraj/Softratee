import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './admin.css';
const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  const [colorUploadingIndex, setColorUploadingIndex] = useState(-1);
  
  const PREDEFINED_COLORS = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Black', hex: '#000000' },
    { name: 'Red', hex: '#EF2222' },
    { name: 'Blue', hex: '#2563EB' },
    { name: 'Green', hex: '#15803D' }
  ];
  const [categories, setCategories] = useState([]);
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const { data: catData } = await api.get('/categories');
        setCategories(catData);
        const { data } = await api.get(`/products/${id}`);
        setName(data.name);
        setPrice(data.price);
        setImage(data.image);
        setCategory(data.category?._id || data.category || (catData[0]?._id || ''));
        setCountInStock(data.countInStock);
        setDescription(data.description);
        setSizes(data.sizes || []);
        const existingColors = data.colors || [];
        const mergedColors = PREDEFINED_COLORS.map(pc => {
          const found = existingColors.find(ec => ec.name.toLowerCase() === pc.name.toLowerCase());
          return found ? { ...pc, image: found.image || '' } : { ...pc, image: '' };
        });
        setColors(mergedColors);
      } catch (err) {
        alert(err.response?.data?.message || 'Error fetching product');
      }
    };
    fetchData();
  }, [id, user, navigate]);
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await api.post('/upload', formData, config);
      setImage(data.imageUrl);
      setUploading(false);
    } catch (err) {
      console.error(err);
      setUploading(false);
      alert('Error uploading image');
    }
  };

  // Color Management
  const handleColorImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setColorUploadingIndex(index);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await api.post('/upload', formData, config);
      
      const updatedColors = [...colors];
      updatedColors[index].image = data.imageUrl;
      setColors(updatedColors);
      
      setColorUploadingIndex(-1);
    } catch (err) {
      console.error(err);
      setColorUploadingIndex(-1);
      alert('Error uploading color image');
    }
  };

  const toggleSize = (sizeOption) => {
    if (sizes.includes(sizeOption)) {
      setSizes(sizes.filter(s => s !== sizeOption));
    } else {
      setSizes([...sizes, sizeOption]);
    }
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/products/${id}`, {
        name,
        price,
        image,
        category,
        description,
        countInStock,
        sizes,
        colors
      });
      navigate('/admin/products');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };
  return (
    <div className="page-container admin-page">
      <div className="admin-header">
        <h2>Edit Product</h2>
      </div>
      <form onSubmit={submitHandler} className="admin-two-column">
        <div>
          <div className="card preview-card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Product Media</h3>
            {image ? (
              <img src={image} alt={name} className="preview-image" />
            ) : (
              <div className="preview-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                No Image
              </div>
            )}
            <div className="form-group mt-3">
              <label>Image URL</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/images/sample.jpg"
              />
            </div>
            <div className="form-group mb-0">
              <label>Upload Image</label>
              <input type="file" onChange={uploadFileHandler} accept="image/*" style={{ padding: '0.5rem 0', border: 'none' }} />
              {uploading && <div className="text-muted mt-1">Uploading...</div>}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="form-group mb-0">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
              />
            </div>
          </div>
          <div className="form-section">
            <h3>Inventory & Variants</h3>
            <div className="form-group" style={{ maxWidth: '200px' }}>
              <label>Stock Quantity</label>
              <input
                type="number"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Available Sizes</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {availableSizes.map(sizeOption => (
                  <button 
                    type="button" 
                    key={sizeOption}
                    onClick={() => toggleSize(sizeOption)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid',
                      borderColor: sizes.includes(sizeOption) ? 'var(--color-accent)' : 'var(--color-border)',
                      backgroundColor: sizes.includes(sizeOption) ? 'var(--color-accent)' : 'var(--color-white)',
                      color: sizes.includes(sizeOption) ? 'var(--color-white)' : 'var(--color-text)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: '500'
                    }}
                  >
                    {sizeOption}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Product Colors</h3>
              <small className="text-muted">Only predefined colors (White, Black, Red, Blue, Green) are supported.</small>
            </div>

            <div className="color-cards-grid">
              {colors.map((color, index) => (
                <div key={index} className="color-card">
                  <div className="color-card-header">
                    <div className="color-swatch" style={{ backgroundColor: color.hex }}></div>
                    <div className="color-name">{color.name}</div>
                  </div>
                  
                  {color.image ? (
                    <img src={color.image} alt={color.name} className="color-image-preview" />
                  ) : (
                    <div className="color-image-placeholder">No image</div>
                  )}
                  
                  <div className="form-group mb-0 mt-2">
                    <label style={{ fontSize: '0.8rem' }}>Change Image</label>
                    <input 
                      type="file" 
                      onChange={(e) => handleColorImageUpload(e, index)} 
                      accept="image/*" 
                      style={{ padding: '0.2rem 0', border: 'none', width: '100%', fontSize: '0.8rem' }} 
                    />
                    {colorUploadingIndex === index && <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>Uploading...</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-light" onClick={() => navigate('/admin/products')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              Update Product
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default ProductEdit;
