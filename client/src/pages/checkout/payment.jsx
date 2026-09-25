import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './payment.css';
const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  useEffect(() => {
    if (user?.isAdmin) {
      navigate('/products');
      return;
    }
    if (!user) {
      navigate(`/login?redirect=payment/${id}`);
      return;
    }
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        if (data.isPaid || data.paymentStatus === 'Paid') {
          navigate(`/order/${id}/confirmation`);
          return;
        }
        setOrder(data);
        if (data.paymentMethod) {
          setPaymentMethod(data.paymentMethod);
        }
        setLoading(false);
      } catch (err) {
        setError('Order not found or not authorized');
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user, navigate]);
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const { data } = await api.post(`/payment/razorpay/create-order`, {
        orderId: id,
      });
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "SoftraTees",
        description: "Order Payment",
        order_id: data.orderId,
        handler: async function (response) {
          try {
            await api.post(`/payment/razorpay/verify`, {
              orderId: id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate(`/order/${id}/confirmation`);
          } catch (verifyErr) {
            alert('Payment verification failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#2563eb", 
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert(`Payment Failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || 'Error initializing payment');
      setIsProcessing(false);
    }
  };
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-selection">
          <h2>Payment Method</h2>
          <p className="payment-subtitle">Choose your preferred payment method</p>
          <div 
            className={`payment-option ${paymentMethod === 'Razorpay' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('Razorpay')}
          >
            <div className="payment-radio">
              <input 
                type="radio" 
                checked={paymentMethod === 'Razorpay'} 
                readOnly
              />
            </div>
            <div className="payment-info">
              <h4>Razorpay</h4>
              <p>UPI • Credit/Debit Cards • Net Banking</p>
            </div>
          </div>
        </div>
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Items:</span>
            <span>₹{(order.itemsPrice || 0).toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>₹{order.shippingPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax:</span>
            <span>₹{order.taxPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row total" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <span>Total:</span>
            <span>₹{order.totalPrice.toFixed(2)}</span>
          </div>
          <button 
            className="btn btn-primary btn-block payment-btn" 
            onClick={handlePayment}
            disabled={isProcessing}
            style={{ marginTop: '2rem', padding: '1rem', fontSize: '1.1rem' }}
          >
            {isProcessing ? 'Processing...' : `Pay ₹${order.totalPrice.toFixed(2)} with ${paymentMethod}`}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Payment;
