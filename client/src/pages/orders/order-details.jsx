import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './order.css';
const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    fetchOrder();
  }, [id, user, navigate]);
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  const OrderTracking = ({ order, user, fetchOrder }) => {
    const initialStatus = order.orderStatus === 'Payment Confirmed' ? 'Placed' : (order.orderStatus || 'Placed');
    const [updateStatus, setUpdateStatus] = useState(initialStatus);
    const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
    const [carrier, setCarrier] = useState(order.carrier || '');
    const deliveryStatuses = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    let currentDeliveryStatus = initialStatus;
    if (!order.orderStatus) {
      if (order.isDelivered) currentDeliveryStatus = 'Delivered';
      else currentDeliveryStatus = 'Placed';
    }
    const timelineSteps = [
      { id: 'Placed', label: 'Placed', isCompleted: true }, 
      { id: 'Payment Confirmed', label: 'Payment Confirmed', isCompleted: order.isPaid || order.paymentStatus === 'Paid' },
      { id: 'Processing', label: 'Processing', isCompleted: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(currentDeliveryStatus) },
      { id: 'Shipped', label: 'Shipped', isCompleted: ['Shipped', 'Out for Delivery', 'Delivered'].includes(currentDeliveryStatus) },
      { id: 'Out for Delivery', label: 'Out for Delivery', isCompleted: ['Out for Delivery', 'Delivered'].includes(currentDeliveryStatus) },
      { id: 'Delivered', label: 'Delivered', isCompleted: ['Delivered'].includes(currentDeliveryStatus) },
    ];
    let activeIndex = 0;
    for (let i = 0; i < timelineSteps.length; i++) {
       if (timelineSteps[i].isCompleted) activeIndex = i;
    }
    const getStepTimestamp = (stepId) => {
      if (stepId === 'Payment Confirmed' && (order.isPaid || order.paymentStatus === 'Paid')) {
        return new Date(order.paidAt || order.updatedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
      }
      if (stepId === 'Placed') {
        const historyItem = order.statusHistory?.find(h => h.status === 'Placed');
        return new Date(historyItem ? historyItem.date : order.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
      }
      if (order.statusHistory) {
         const historyItem = order.statusHistory.slice().reverse().find(h => h.status === stepId);
         if (historyItem) {
           return new Date(historyItem.date).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
         }
      }
      if (stepId === 'Delivered' && order.isDelivered && order.deliveredAt) {
         return new Date(order.deliveredAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
      }
      if (stepId === 'Shipped' && order.shippedAt) {
         return new Date(order.shippedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
      }
      return 'Pending';
    };
    const getStatusMessage = () => {
      if (order.orderStatus === 'Cancelled') return "This order has been cancelled.";
      if (currentDeliveryStatus === 'Delivered') return "Your order has been delivered.";
      if (currentDeliveryStatus === 'Out for Delivery') return "Your order is out for delivery.";
      if (currentDeliveryStatus === 'Shipped') return "Your order has been shipped.";
      if (currentDeliveryStatus === 'Processing') return "Your order is being prepared.";
      if (order.isPaid || order.paymentStatus === 'Paid') return "Your payment has been confirmed.";
      return "Your order has been placed successfully.";
    };
    const getHighlightedStatusLabel = () => {
      if (order.orderStatus === 'Cancelled') return 'Cancelled';
      return timelineSteps[activeIndex].label;
    };
    const handleUpdateStatus = async () => {
      try {
        await api.put(`/orders/${order._id}/status`, {
          status: updateStatus,
          trackingNumber: updateStatus === 'Shipped' ? trackingNumber : undefined,
          carrier: updateStatus === 'Shipped' ? carrier : undefined
        });
        fetchOrder();
      } catch (err) {
        alert(err.response?.data?.message || 'Error updating status');
      }
    };
    return (
      <div className="order-tracking-container">
        <h4>Order Status</h4>
        <div className="status-message">
          <p className="status-highlight"><strong>{getHighlightedStatusLabel()}</strong></p>
          <p>{getStatusMessage()}</p>
          {(currentDeliveryStatus === 'Shipped' || currentDeliveryStatus === 'Out for Delivery' || currentDeliveryStatus === 'Delivered') && order.trackingNumber && (
             <div className="tracking-info">
               <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
               {order.carrier && <p><strong>Carrier:</strong> {order.carrier}</p>}
             </div>
          )}
        </div>
        {order.orderStatus !== 'Cancelled' && (
          <div className="tracking-timeline">
            {timelineSteps.map((step, index) => {
               const isCompleted = step.isCompleted;
               const isCurrent = index === activeIndex;
               return (
                 <div key={step.id} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                   <div className="step-circle">{isCompleted ? '✓' : '○'}</div>
                   <div className="step-label">{step.label}</div>
                   <div className="step-timestamp">{isCompleted ? getStepTimestamp(step.id) : 'Pending'}</div>
                   {index < timelineSteps.length - 1 && (
                     <div className={`step-line ${timelineSteps[index + 1]?.isCompleted ? 'completed-line' : ''}`}></div>
                   )}
                 </div>
               )
            })}
          </div>
        )}
        {user.isAdmin && (
           <div className="admin-status-update">
              <h5>Admin Control Panel</h5>
              <div className="form-group">
                <select value={updateStatus} onChange={e => setUpdateStatus(e.target.value)} className="form-control">
                   {deliveryStatuses.concat(['Cancelled']).map(s => (
                     <option key={s} value={s}>{s}</option>
                   ))}
                </select>
              </div>
              {updateStatus === 'Shipped' && (
                 <>
                   <div className="form-group">
                     <input type="text" placeholder="Tracking Number" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="form-control" />
                   </div>
                   <div className="form-group">
                     <input type="text" placeholder="Carrier" value={carrier} onChange={e => setCarrier(e.target.value)} className="form-control" />
                   </div>
                 </>
              )}
              <button className="btn btn-dark" onClick={handleUpdateStatus}>Update Status</button>
           </div>
        )}
      </div>
    )
  }
  return (
    <div className="order-page">
      <h2>Order {order._id}</h2>
      <div className="order-container">
        <div className="order-details">
          <div className="order-section">
            <h3>Shipping Details</h3>
            <p><strong>Name: </strong> {order.user.name}</p>
            <p><strong>Email: </strong> <a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>
            <p>
              <strong>Address: </strong>
              {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
          </div>
          <div className="order-section">
             <OrderTracking order={order} user={user} fetchOrder={fetchOrder} />
          </div>
          <div className="order-section">
            <h3>Payment Method</h3>
            <p><strong>Method: </strong> {order.paymentMethod}</p>
            {order.isPaid ? (
              <div className="alert alert-success">Paid on {new Date(order.paidAt).toLocaleString()}</div>
            ) : (
              <div className="alert alert-danger">Not Paid</div>
            )}
          </div>
          <div className="order-section">
            <h3>Order Items</h3>
            {order.orderItems.length === 0 ? (
              <div>Order is empty</div>
            ) : (
              <div className="order-items">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="order-item">
                    <img src={item.image} alt={item.name} />
                    <div className="order-item-info">
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                      {item.customConfig && <span className="custom-badge">Customized</span>}
                    </div>
                    <div className="order-item-price">
                      {item.qty} x ₹{item.price.toFixed(2)} = ₹{(item.qty * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{(order.itemsPrice || 0).toFixed(2)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="summary-row" style={{ color: '#dc3545' }}>
              <span>Discount ({order.couponCode}):</span>
              <span>-₹{order.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Shipping:</span>
            <span>₹{order.shippingPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax:</span>
            <span>₹{order.taxPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>₹{order.totalPrice.toFixed(2)}</span>
          </div>
          {!order.isPaid && (
            <Link to={`/payment/${order._id}`} className="btn btn-primary btn-block" style={{ textAlign: 'center', display: 'block' }}>
              Complete Payment
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
export default OrderDetails;
