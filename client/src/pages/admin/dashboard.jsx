import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Package, Tags, ShoppingCart, Users, Ticket, 
  Palette, Image as ImageIcon, ChevronRight,
  TrendingUp, Box, Clock, UserCheck
} from 'lucide-react';
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
      <div className="admin-header-section">
        <h2 className="admin-page-title">Admin Dashboard</h2>
        <p className="admin-page-subtitle">Overview of your store activity</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-header">
            <span className="stat-label">TOTAL SALES</span>
            <TrendingUp size={18} className="stat-icon" />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>₹{totalSales.toFixed(2)}</div>
          <div className="stat-caption">All time</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-header">
            <span className="stat-label">TOTAL ORDERS</span>
            <Box size={18} className="stat-icon" />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{totalOrders}</div>
          <div className="stat-caption">All orders</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-header">
            <span className="stat-label">PENDING SHIPMENTS</span>
            <Clock size={18} className="stat-icon" />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{pendingOrders}</div>
          <div className="stat-caption">Requires attention</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-header">
            <span className="stat-label">REGISTERED USERS</span>
            <UserCheck size={18} className="stat-icon" />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-accent)' }}>{usersCount}</div>
          <div className="stat-caption">Registered customers</div>
        </div>
      </div>

      <div className="admin-management-sections">
        
        <div className="management-group">
          <h3 className="group-title">CATALOG</h3>
          <div className="group-grid">
            <div className="nav-card" onClick={() => navigate('/admin/products')}>
              <div className="nav-card-icon"><Package size={22} /></div>
              <div className="nav-card-content">
                <h4>Manage Products</h4>
                <p>Add, edit and manage your T-shirt catalog</p>
              </div>
              <ChevronRight size={18} className="nav-card-arrow" />
            </div>
            <div className="nav-card" onClick={() => navigate('/admin/categories')}>
              <div className="nav-card-icon"><Tags size={22} /></div>
              <div className="nav-card-content">
                <h4>Manage Categories</h4>
                <p>Organize products by category</p>
              </div>
              <ChevronRight size={18} className="nav-card-arrow" />
            </div>
          </div>
        </div>

        <div className="management-group">
          <h3 className="group-title">ORDERS</h3>
          <div className="group-grid">
            <div className="nav-card" onClick={() => navigate('/admin/orders')}>
              <div className="nav-card-icon"><ShoppingCart size={22} /></div>
              <div className="nav-card-content">
                <h4>Manage Orders</h4>
                <p>Review and manage customer orders</p>
              </div>
              <ChevronRight size={18} className="nav-card-arrow" />
            </div>
            <div className="nav-card" onClick={() => navigate('/admin/designs')}>
              <div className="nav-card-icon"><Palette size={22} /></div>
              <div className="nav-card-content">
                <h4>Custom Designs</h4>
                <p>Review customer customization requests</p>
              </div>
              <ChevronRight size={18} className="nav-card-arrow" />
            </div>
          </div>
        </div>

        <div className="management-group">
          <h3 className="group-title">CUSTOMERS</h3>
          <div className="group-grid">
            <div className="nav-card" onClick={() => navigate('/admin/users')}>
              <div className="nav-card-icon"><Users size={22} /></div>
              <div className="nav-card-content">
                <h4>Manage Users</h4>
                <p>Manage registered customers</p>
              </div>
              <ChevronRight size={18} className="nav-card-arrow" />
            </div>
          </div>
        </div>

        <div className="management-group">
          <h3 className="group-title">MARKETING</h3>
          <div className="group-grid">
            <div className="nav-card" onClick={() => navigate('/admin/coupons')}>
              <div className="nav-card-icon"><Ticket size={22} /></div>
              <div className="nav-card-content">
                <h4>Manage Coupons</h4>
                <p>Create and manage discount codes</p>
              </div>
              <ChevronRight size={18} className="nav-card-arrow" />
            </div>
            <div className="nav-card" onClick={() => navigate('/admin/banners')}>
              <div className="nav-card-icon"><ImageIcon size={22} /></div>
              <div className="nav-card-content">
                <h4>Homepage Banners</h4>
                <p>Manage storefront promotional banners</p>
              </div>
              <ChevronRight size={18} className="nav-card-arrow" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
