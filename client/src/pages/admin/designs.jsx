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
    <div className="admin-page">
      <h2>Custom Design Library</h2>
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <h3>Upload New Design</h3>
        <form className="admin-form" onSubmit={submitHandler}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Image</label>
            <input type="file" onChange={uploadFileHandler} />
            {uploading && <p>Uploading...</p>}
            {imageUrl && <img src={imageUrl} alt="preview" style={{ width: '100px', marginTop: '10px' }} />}
          </div>
          <button type="submit" className="btn btn-primary" disabled={uploading}>Save Design</button>
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
              <th>NAME</th>
              <th>IMAGE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {designs.map((d) => (
              <tr key={d._id}>
                <td>{d._id.substring(0, 8)}...</td>
                <td>{d.name}</td>
                <td><img src={d.imageUrl} alt={d.name} style={{ width: '50px' }} /></td>
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
  );
};
export default AdminDesigns;
