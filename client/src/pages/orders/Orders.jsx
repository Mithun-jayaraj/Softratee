import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import '../profile/profile.css'; // Reusing profile styles or we can create orders.css

const Orders = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
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

  if (!user || user.isAdmin) {
    if (user && user.isAdmin) {
        return (
            <div className="container" style={{ padding: '2rem 1rem' }}>
                <h2>My Orders</h2>
                <p>Admin users manage orders from the Admin Dashboard.</p>
                <Link to="/admin" className="btn btn-primary">Go to Dashboard</Link>
            </div>
        );
    }
    return null;
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="mb-3" style={{ fontSize: '24px', fontWeight: 'bold' }}>MY ORDERS</h2>
      
      {loadingOrders ? (
        <div className="text-muted">Loading orders...</div>
      ) : errorOrders ? (
        <div className="text-danger">{errorOrders}</div>
      ) : orders.length === 0 ? (
        <div className="empty-orders-state" style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
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
              <div key={order._id} className="order-card" style={{ border: '1px solid #eaeaea', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'white' }}>
                <div className="order-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eaeaea', paddingBottom: '1rem' }}>
                  <div className="order-id-date" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <strong style={{ fontSize: '1.1rem' }}>Order #{order._id.substring(0, 8).toUpperCase()}</strong>
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>Date: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
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
                
                <div className="order-card-items" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {order.orderItems.map((item, index) => (
                      <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eaeaea' }} />
                          <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '500' }}>{item.name}</div>
                              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                  {item.size ? `Size: ${item.size}` : ''} {item.color ? ` | Color: ${item.color}` : ''} | Qty: {item.qty}
                              </div>
                          </div>
                      </div>
                  ))}
                </div>

                <div className="order-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <div>
                    <div className="order-card-total" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total: ₹{order.totalPrice.toFixed(2)}</div>
                  </div>
                  <div className="d-flex gap-2">
                    {(!order.isPaid && order.paymentStatus !== 'Paid') ? (
                      <Link to={`/payment/${order._id}`} className="btn btn-primary">Complete Payment</Link>
                    ) : (
                      <Link to={`/order/${order._id}`} className="btn btn-light" style={{ border: '1px solid #ccc' }}>View Details</Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
