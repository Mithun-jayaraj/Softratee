import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './profile.css';
const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [updateMessage, setUpdateMessage] = useState({ text: '', type: '' });
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setName(user.name);
      if (user.defaultAddress) {
        setAddress(user.defaultAddress.address || '');
        setCity(user.defaultAddress.city || '');
        setPostalCode(user.defaultAddress.postalCode || '');
        setCountry(user.defaultAddress.country || '');
      }
      const fetchMyOrders = async () => {
        try {
          const { data } = await api.get('/orders/myorders');
          setOrders(data);
          setLoadingOrders(false);
        } catch (err) {
          setErrorOrders('Failed to fetch orders');
          setLoadingOrders(false);
        }
      };
      fetchMyOrders();
    }
  }, [user, navigate]);
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/profile', {
        name,
        password,
        defaultAddress: { address, city, postalCode, country }
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUpdateMessage({ text: 'Profile Updated Successfully', type: 'success' });
      setTimeout(() => {
        setUpdateMessage({ text: '', type: '' });
        window.location.reload(); 
      }, 1500);
    } catch (error) {
      console.error(error);
      setUpdateMessage({ 
        text: error.response?.data?.message || 'Update failed', 
        type: 'error' 
      });
    }
  };
  if (!user) return null;
  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-sidebar">
          {updateMessage.text && (
            <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: updateMessage.type === 'error' ? 'var(--color-error-bg)' : 'var(--color-success-bg)', color: updateMessage.type === 'error' ? 'var(--color-error)' : 'var(--color-success)', marginBottom: '1rem' }}>
              {updateMessage.text}
            </div>
          )}
          <form onSubmit={submitHandler}>
            <div className="card mb-3">
              <h3 className="profile-section-title">Personal Information</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={user.email} disabled style={{ backgroundColor: 'var(--color-bg)' }} />
              </div>
              <div className="form-group mb-0">
                <label>New Password (Optional)</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
              </div>
            </div>
            {!user.isAdmin && (
              <div className="card mb-3">
                <h3 className="profile-section-title">Delivery Address</h3>
                <div className="form-group">
                  <label>Street Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="form-row d-flex gap-3">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Postal Code</label>
                    <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                  </div>
                </div>
                <div className="form-group mb-0">
                  <label>Country</label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-block mt-2">Save Changes</button>
          </form>
          {user.isAdmin && (
            <div className="card mt-2">
              <h3 className="profile-section-title">Admin Controls</h3>
              <p className="text-muted mb-3">Manage products, orders, and users.</p>
              <Link to="/admin" className="btn btn-dark btn-block">Go to Dashboard</Link>
            </div>
          )}
        </div>
        {!user.isAdmin && (
          <div className="profile-orders">
            <h2 className="mb-3">My Orders</h2>
            {loadingOrders ? (
              <div className="text-muted">Loading orders...</div>
            ) : errorOrders ? (
              <div className="text-danger">{errorOrders}</div>
            ) : orders.length === 0 ? (
              <div className="empty-orders-state">
                <h3>No orders yet</h3>
                <p>You haven't placed an order yet. Browse our collection!</p>
                <Link to="/products" className="btn btn-primary mt-3">Start Shopping</Link>
              </div>
            ) : (
              <div>
                {orders.map((order) => {
                  let status = order.orderStatus;
                  if (!status) {
                    if (order.isDelivered) status = 'Delivered';
                    else status = 'Placed';
                  }
                  if (status === 'Payment Confirmed') {
                    status = 'Placed';
                  }
                  let badgeClass = 'badge-neutral';
                  if (status === 'Processing' || status === 'Placed') badgeClass = 'badge-pending';
                  else if (status === 'Shipped' || status === 'Out for Delivery') badgeClass = 'badge-pending';
                  else if (status === 'Delivered') badgeClass = 'badge-success';
                  else if (status === 'Cancelled') badgeClass = 'badge-error';
                  return (
                    <div key={order._id} className="order-card">
                      <div className="order-card-header">
                        <div className="order-id-date">
                          <strong>Order #{order._id.substring(0, 8).toUpperCase()}</strong>
                          <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span className={`badge ${badgeClass}`}>{status}</span>
                          {order.isPaid || order.paymentStatus === 'Paid' ? (
                            <span className="badge badge-success">Paid</span>
                          ) : (
                            <span className="badge badge-neutral">Payment Pending</span>
                          )}
                        </div>
                      </div>
                      <div className="order-card-body">
                        <div>
                          <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                            {order.orderItems.length} {order.orderItems.length === 1 ? 'Item' : 'Items'}
                          </p>
                          <div className="order-card-total">₹{order.totalPrice.toFixed(2)}</div>
                        </div>
                        <div className="d-flex gap-2">
                          {(!order.isPaid && order.paymentStatus !== 'Paid') ? (
                            <Link to={`/payment/${order._id}`} className="btn btn-primary">Complete Payment</Link>
                          ) : (
                            <Link to={`/order/${order._id}`} className="btn btn-light">Track Order</Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default Profile;
