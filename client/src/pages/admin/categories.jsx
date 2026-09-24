import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './admin.css';
const AdminCategories = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch categories');
        setLoading(false);
      }
    };
    fetchCategories();
  }, [user, navigate]);
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/categories', { name, description });
      setCategories([...categories, data]);
      setName('');
      setDescription('');
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    }
  };
  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/categories/${id}`);
        setCategories(categories.filter(c => c._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };
  return (
    <div className="admin-page">
      <h2>Manage Categories</h2>
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <h3>Create New Category</h3>
        <form className="admin-form" onSubmit={submitHandler}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Create Category</button>
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
              <th>DESCRIPTION</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id}>
                <td>{c._id.substring(0, 8)}...</td>
                <td>{c.name}</td>
                <td>{c.description}</td>
                <td className="table-actions">
                  <button className="btn btn-danger" onClick={() => deleteHandler(c._id)}>
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
export default AdminCategories;
