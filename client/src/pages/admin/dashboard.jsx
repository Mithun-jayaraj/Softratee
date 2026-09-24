import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './admin.css';
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    const fetchOrdersAndUsers = async () => {
      try {
        const { data: ordersData } = await api.get('/orders');
        setOrders(ordersData);
        try {
          const { data: usersData } = await api.get('/auth');
          setUsersCount(usersData.length);
        } catch (e) {
          setUsersCount(0);
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchOrdersAndUsers();
  }, [user, navigate]);
  if (loading) return <div className="page-container">Loading Dashboard...</div>;
  const totalSales = orders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => !order.isDelivered && order.isPaid).length;
  return (
    <div className="page-container admin-page">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
      </div>
      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="stat-card-title">Total Sales</div>
          <div className="stat-card-value success">₹{totalSales.toFixed(2)}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-title">Total Orders</div>
          <div className="stat-card-value">{totalOrders}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-title">Pending Shipments</div>
          <div className="stat-card-value danger">{pendingOrders}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-title">Registered Users</div>
          <div className="stat-card-value accent">{usersCount}</div>
        </div>
      </div>
      <div className="admin-header mt-4">
        <h3>Management Hub</h3>
      </div>
      <div className="management-hub">
        <div className="hub-card" onClick={() => navigate('/admin/products')}>
          <div className="hub-icon">📦</div>
          <div>Manage Products</div>
        </div>
        <div className="hub-card" onClick={() => navigate('/admin/categories')}>
          <div className="hub-icon">🏷️</div>
          <div>Manage Categories</div>
        </div>
        <div className="hub-card" onClick={() => navigate('/admin/orders')}>
          <div className="hub-icon">🛒</div>
          <div>Manage Orders</div>
        </div>
        <div className="hub-card" onClick={() => navigate('/admin/users')}>
          <div className="hub-icon">👥</div>
          <div>Manage Users</div>
        </div>
        <div className="hub-card" onClick={() => navigate('/admin/coupons')}>
          <div className="hub-icon">🎫</div>
          <div>Manage Coupons</div>
        </div>
        <div className="hub-card" onClick={() => navigate('/admin/designs')}>
          <div className="hub-icon">🎨</div>
          <div>Custom Designs</div>
        </div>
        <div className="hub-card" onClick={() => navigate('/admin/banners')}>
          <div className="hub-icon">🖼️</div>
          <div>Homepage Banners</div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
