import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './admin.css';
const AdminDesigns = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    const fetchDesigns = async () => {
      try {
        const { data } = await api.get('/designs');
        setDesigns(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch designs');
        setLoading(false);
      }
    };
    fetchDesigns();
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
      const { data } = await api.post('/designs', { name, imageUrl });
      setDesigns([...designs, data]);
      setName('');
      setImageUrl('');
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    }
  };
  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/designs/${id}`);
        setDesigns(designs.filter(d => d._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };
  return (
    <div className="page-container admin-page">
      <div className="admin-header-section" style={{ marginBottom: '2rem' }}>
        <h2 className="admin-page-title">Custom Design Library</h2>
        <p className="admin-page-subtitle">Upload and manage custom designs for your store.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>Upload New Design</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>Add a new design to your custom design library.</p>
        </div>
        <form onSubmit={submitHandler}>
          <div style={{ maxWidth: '600px' }}>
            <div className="form-group">
              <label>Design Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter design name" required />
            </div>
            <div className="form-group">
              <label>Design Image</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input type="file" onChange={uploadFileHandler} style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Upload a high-quality image for your custom design.</span>
              </div>
              {uploading && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-primary)' }}>Uploading...</p>}
              {imageUrl && <img src={imageUrl} alt="preview" style={{ width: '100px', marginTop: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={uploading}>+ Save Design</button>
            </div>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>Saved Designs</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>Manage your uploaded custom designs.</p>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : designs.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-text)', fontSize: '1.1rem' }}>No custom designs yet</h4>
            <p>Upload your first custom design using the form above.</p>
          </div>
        ) : (
          <div className="table-wrapper">
          <table className="table admin-designs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>IMAGE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {designs.map((d) => (
                <tr key={d._id}>
                  <td style={{ fontFamily: 'monospace' }}>{d._id.substring(0, 8)}...</td>
                  <td style={{ fontWeight: 500 }}>{d.name}</td>
                  <td>
                    <img src={d.imageUrl} alt={d.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                  </td>
                  <td className="table-actions">
                    <button className="btn btn-danger" onClick={() => deleteHandler(d._id)}>
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
export default AdminDesigns;
