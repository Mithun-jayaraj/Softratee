import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './admin.css';
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
    } else {
      const fetchOrders = async () => {
        try {
          const { data } = await api.get('/orders');
          setOrders(data);
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch orders');
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user, navigate]);
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Manage Orders</h2>
      </div>
      <div className="table-wrapper">
        <table className="table">
        <thead>
          <tr>
            <th>ORDER ID</th>
            <th>CUSTOMER</th>
            <th>PRODUCT</th>
            <th>QTY</th>
            <th>TOTAL</th>
            <th>PAYMENT</th>
            <th>STATUS</th>
            <th>DATE</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const firstProduct = order.orderItems && order.orderItems.length > 0 ? order.orderItems[0].name : 'N/A';
            const productDisplay = order.orderItems?.length > 1 ? `${firstProduct} +${order.orderItems.length - 1} more` : firstProduct;
            const totalQty = order.orderItems?.reduce((acc, item) => acc + item.qty, 0) || 0;
            return (
              <tr key={order._id}>
                <td style={{ fontFamily: 'monospace' }}>#{order._id.substring(0, 8).toUpperCase()}</td>
                <td>{order.user && order.user.name}</td>
                <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{productDisplay}</td>
                <td>{totalQty}</td>
                <td style={{ fontWeight: '500' }}>₹{order.totalPrice.toFixed(2)}</td>
                <td>
                  {order.isPaid || order.paymentStatus === 'Paid' ? (
                    <span className="badge badge-success">Paid</span>
                  ) : (
                    <span className="badge badge-pending">Pending</span>
                  )}
                </td>
                <td>
                  {(() => {
                    let status = order.orderStatus;
                    if (!status) {
                      if (order.isDelivered) status = 'Delivered';
                      else status = 'Placed';
                    }
                    if (status === 'Payment Confirmed') {
                      status = 'Placed';
                    }
                    let badgeClass = 'badge-neutral';
                    if (status === 'Delivered') badgeClass = 'badge-success';
                    else if (status === 'Cancelled') badgeClass = 'badge-error';
                    else if (status === 'Shipped' || status === 'Out for Delivery') badgeClass = 'badge-pending';
                    else if (status === 'Processing') badgeClass = 'badge-pending';
                    else if (status === 'Placed') badgeClass = 'badge-pending';
                    return (
                      <span className={`badge ${badgeClass}`}>
                        {status}
                      </span>
                    );
                  })()}
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td className="table-actions">
                  <Link to={`/order/${order._id}`} className="btn btn-light">
                    View Details
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
};
export default Orders;
