import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './admin.css';
const AdminCoupons = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    const fetchCoupons = async () => {
      try {
        const { data } = await api.get('/coupons');
        setCoupons(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch coupons');
        setLoading(false);
      }
    };
    fetchCoupons();
  }, [user, navigate]);
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/coupons', { code, discountPercent });
      setCoupons([...coupons, data]);
      setCode('');
      setDiscountPercent('');
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    }
  };
  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/coupons/${id}`);
        setCoupons(coupons.filter(c => c._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };
  return (
    <div className="page-container admin-page">
      <div className="admin-header-section" style={{ marginBottom: '2rem' }}>
        <h2 className="admin-page-title">Coupons</h2>
        <p className="admin-page-subtitle">Create and manage discount coupons for your store.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>Create New Coupon</h3>
        </div>
        <form onSubmit={submitHandler}>
          <div style={{ maxWidth: '700px' }}>
            <div className="form-row" style={{ gap: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Coupon Code</label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. SUMMER20" required />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Discount Percentage</label>
                <input type="number" min="1" max="100" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="e.g. 20" required />
              </div>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">Create Coupon</button>
            </div>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>All Coupons</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>Manage your active discount codes.</p>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : coupons.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-text)', fontSize: '1.1rem' }}>No coupons yet</h4>
            <p>Create your first discount coupon to offer promotions to customers.</p>
          </div>
        ) : (
          <div className="table-wrapper">
          <table className="table admin-coupons-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>CODE</th>
                <th>DISCOUNT</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{c._id.substring(0, 8)}...</td>
                  <td style={{ fontWeight: 600 }}>{c.code}</td>
                  <td style={{ fontSize: '1.1rem', fontWeight: 600 }}>{c.discountPercent}%</td>
                  <td>
                    {c.isActive || c.isActive === undefined ? (
                      <span className="badge badge-success">● Active</span>
                    ) : (
                      <span className="badge badge-neutral">● Inactive</span>
                    )}
                  </td>
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
    </div>
  );
};
export default AdminCoupons;
