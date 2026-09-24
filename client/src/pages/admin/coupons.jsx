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
    <div className="admin-page">
      <h2>Coupons</h2>
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <h3>Create New Coupon</h3>
        <form className="admin-form" onSubmit={submitHandler}>
          <div className="form-group">
            <label>Code (e.g. SUMMER20)</label>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Discount Percentage (e.g. 20)</label>
            <input type="number" min="1" max="100" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Create</button>
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
              <th>CODE</th>
              <th>DISCOUNT %</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id}>
                <td>{c._id.substring(0, 8)}...</td>
                <td>{c.code}</td>
                <td>{c.discountPercent}%</td>
                <td>{c.isActive ? 'Active' : 'Inactive'}</td>
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
export default AdminCoupons;
