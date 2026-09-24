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
    <div className="admin-page">
      <h2>Homepage Banners</h2>
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <h3>Upload New Banner</h3>
        <form className="admin-form" onSubmit={submitHandler}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Image</label>
            <input type="file" onChange={uploadFileHandler} />
            {uploading && <p>Uploading...</p>}
            {imageUrl && <img src={imageUrl} alt="preview" style={{ width: '150px', marginTop: '10px' }} />}
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="isactive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <label htmlFor="isactive" style={{ margin: 0 }}>Active</label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={uploading}>Save Banner</button>
        </form>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="table-wrapper">
        <table className="table">
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
                <td>{b._id.substring(0, 8)}...</td>
                <td>{b.title}</td>
                <td><img src={b.imageUrl} alt={b.title} style={{ width: '100px' }} /></td>
                <td>
                  <button 
                    className={`btn ${b.isActive ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => toggleActiveHandler(b._id, b.isActive)}
                  >
                    {b.isActive ? 'Active' : 'Inactive'}
                  </button>
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
  );
};
export default AdminBanners;
