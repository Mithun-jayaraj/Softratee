import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './admin.css';
const AdminBanners = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    const fetchBanners = async () => {
      try {
        const { data } = await api.get('/banners');
        setBanners(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch banners');
        setLoading(false);
      }
    };
    fetchBanners();
  }, [user, navigate]);
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await api.post('/upload', formData, config);
      setImageUrl(data.url);
      setUploading(false);
    } catch (err) {
      alert('Image upload failed');
      setUploading(false);
    }
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Please upload an image first');
      return;
    }
    try {
      const { data } = await api.post('/banners', { title, imageUrl, isActive });
      setBanners([...banners, data]);
      setTitle('');
      setImageUrl('');
      setIsActive(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    }
  };
  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/banners/${id}`);
        setBanners(banners.filter(b => b._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };
  const toggleActiveHandler = async (id, currentStatus) => {
    try {
      const { data } = await api.put(`/banners/${id}`, { isActive: !currentStatus });
      setBanners(banners.map(b => (b._id === id ? data : b)));
    } catch (err) {
      alert('Update failed');
    }
  };
  return (
    <div className="page-container admin-page">
      <div className="admin-header-section" style={{ marginBottom: '2rem' }}>
        <h2 className="admin-page-title">Homepage Banners</h2>
        <p className="admin-page-subtitle">Create and manage promotional banners for your storefront.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>Upload New Banner</h3>
        </div>
        <form onSubmit={submitHandler}>
          <div style={{ maxWidth: '600px' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Banner Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Summer Collection Sale" required />
            </div>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Banner Image</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input type="file" onChange={uploadFileHandler} style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>JPG, PNG or WEBP. Upload a high-quality image for your banner.</span>
              </div>
              {uploading && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-primary)' }}>Uploading...</p>}
              {imageUrl && <img src={imageUrl} alt="preview" style={{ width: '160px', height: '80px', marginTop: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', objectFit: 'cover' }} />}
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input type="checkbox" id="isactive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ width: 'auto', margin: 0 }} />
              <label htmlFor="isactive" style={{ margin: 0, fontWeight: 500, color: 'var(--color-text)' }}>Active - Show this banner on the homepage</label>
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={uploading}>Save Banner</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>Homepage Banners</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>Manage your existing promotional banners.</p>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : banners.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-text)', fontSize: '1.1rem' }}>No homepage banners yet</h4>
            <p>Upload your first banner to promote products, offers, or collections.</p>
          </div>
        ) : (
          <div className="table-wrapper">
          <table className="table admin-banners-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TITLE</th>
                <th>IMAGE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b) => (
                <tr key={b._id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{b._id.substring(0, 8)}...</td>
                  <td style={{ fontWeight: 600 }}>{b.title}</td>
                  <td>
                    {b.imageUrl ? (
                      <img src={b.imageUrl} alt={b.title} style={{ width: '140px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>No image</span>
                    )}
                  </td>
                  <td>
                    <span 
                      className={`badge ${b.isActive ? 'badge-success' : 'badge-neutral'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleActiveHandler(b._id, b.isActive)}
                    >
                      {b.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td className="table-actions">
                    <button className="btn btn-danger" onClick={() => deleteHandler(b._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminBanners;
