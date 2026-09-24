import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './admin.css';
const AdminUserEdit = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    const fetchUser = async () => {
      try {
        const { data } = await api.get(`/auth/${id}`);
        setName(data.name);
        setEmail(data.email);
        setIsAdmin(data.isAdmin);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user');
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, user, navigate]);
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/auth/${id}`, { name, email, isAdmin });
      navigate('/admin/users');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };
  return (
    <div className="admin-page">
      <h2>Edit User</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <form className="admin-form" onSubmit={submitHandler}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="isadmin"
              checked={isAdmin} 
              onChange={(e) => setIsAdmin(e.target.checked)} 
            />
            <label htmlFor="isadmin" style={{ margin: 0 }}>Is Admin</label>
          </div>
          <button type="submit" className="btn btn-primary">Update</button>
        </form>
      )}
    </div>
  );
};
export default AdminUserEdit;
