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
  const [mobileNumber, setMobileNumber] = useState('');
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
        setMobileNumber(data.mobileNumber || '');
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
    const trimmedMobile = mobileNumber.trim();
    if (trimmedMobile && !/^\d{10}$/.test(trimmedMobile)) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    try {
      await api.put(`/auth/${id}`, { name, email, mobileNumber: trimmedMobile, isAdmin });
      navigate('/admin/users');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };
  return (
    <div className="page-container admin-page">
      <div className="admin-header-section">
        <h2 className="admin-page-title">Edit User</h2>
        <p className="admin-page-subtitle">Update user information and account permissions.</p>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <form onSubmit={submitHandler}>
            <div className="card">
              <div className="form-section">
                <h3>User Information</h3>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <div style={{ display: 'flex' }}>
                    <span style={{ padding: '0.375rem 0.75rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRight: 'none', borderTopLeftRadius: 'var(--radius-sm)', borderBottomLeftRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>+91</span>
                    <input type="text" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" style={{ flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Admin Role</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      id="isadmin"
                      checked={isAdmin} 
                      onChange={(e) => setIsAdmin(e.target.checked)} 
                      style={{ cursor: 'pointer', width: 'auto', height: 'auto', margin: 0 }}
                    />
                    <label htmlFor="isadmin" style={{ margin: 0, fontWeight: 'normal', cursor: 'pointer' }}>Administrator access</label>
                  </div>
                  <small className="text-muted" style={{ display: 'block', marginTop: '0.5rem' }}>Administrators can access administrative features.</small>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-light" onClick={() => navigate('/admin/users')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update User
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default AdminUserEdit;
