import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './confirmation.css';
const Confirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (user?.isAdmin) {
      navigate('/products');
      return;
    }
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError('Order not found or not authorized');
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user, navigate]);
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  const isPaid = order.isPaid || order.paymentStatus === 'Paid';
  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-icon">
          {isPaid ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
        </div>
        {isPaid ? (
          <>
            <h2>Payment Successful</h2>
            <h3>Order Confirmed!</h3>
          </>
        ) : (
          <>
            <h2>Order Placed</h2>
            <h3>Payment Pending</h3>
          </>
        )}
        <p className="confirmation-message">
          Your order <strong>#{order._id.substring(0, 8).toUpperCase()}</strong> has been {isPaid ? 'placed successfully' : 'saved'}.
        </p>
        <div className="confirmation-details">
          <div className="detail-row">
            <span>Payment:</span>
            <span className={`status-badge ${isPaid ? 'paid' : 'pending'}`}>
              {isPaid ? 'Paid' : 'Pending'}
            </span>
          </div>
          <div className="detail-row">
            <span>Method:</span>
            <span>{order.paymentMethod || 'Not Selected'}</span>
          </div>
          <div className="detail-row total">
            <span>Total:</span>
            <span>₹{order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
        <div className="confirmation-actions">
          {isPaid ? (
            <>
              <Link to={`/order/${order._id}`} className="btn btn-primary">Track Order</Link>
              <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
            </>
          ) : (
            <>
              <Link to={`/payment/${order._id}`} className="btn btn-primary">Complete Payment</Link>
              <Link to={`/order/${order._id}`} className="btn btn-outline">View Order</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default Confirmation;
