import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './checkout.css';
const Checkout = () => {
  const { cartItems, shippingAddress, saveShippingAddress, savePaymentMethod, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [address, setAddress] = useState(shippingAddress.address || user?.defaultAddress?.address || '');
  const [city, setCity] = useState(shippingAddress.city || user?.defaultAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || user?.defaultAddress?.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || user?.defaultAddress?.country || '');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await api.get('/coupons/available');
        setAvailableCoupons(data);
      } catch (err) {
        console.error('Failed to fetch coupons');
      }
    };
    fetchCoupons();
  }, []);
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
    } else {
      if (!shippingAddress.address && user.defaultAddress) {
        setAddress(user.defaultAddress.address || '');
        setCity(user.defaultAddress.city || '');
        setPostalCode(user.defaultAddress.postalCode || '');
        setCountry(user.defaultAddress.country || '');
      }
    }
    if (cartItems.length === 0 && !isOrderPlaced) {
      navigate('/cart');
    }
  }, [user, navigate, cartItems, shippingAddress, isOrderPlaced]);
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discountAmount = appliedCoupon ? itemsPrice * (appliedCoupon.discountPercent / 100) : 0;
  const discountedSubtotal = itemsPrice - discountAmount;
  const shippingPrice = discountedSubtotal > 100 ? 0 : 10;
  const taxPrice = 0.15 * discountedSubtotal;
  const totalPrice = discountedSubtotal + shippingPrice + taxPrice;
  const applyCouponHandler = async () => {
    setCouponError('');
    setCouponSuccess('');
    if (!couponCodeInput.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    try {
      const { data } = await api.post('/coupons/verify', { code: couponCodeInput.trim() });
      setAppliedCoupon(data);
      setCouponSuccess('Coupon applied successfully');
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || 'Invalid coupon');
    }
  };
  const removeCouponHandler = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponSuccess('');
    setCouponError('');
  };
  const placeOrderHandler = async () => {
    saveShippingAddress({ address, city, postalCode, country });
    savePaymentMethod('Razorpay');
    try {
      const orderItems = cartItems.map(item => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item.product,
        size: item.size,
        color: item.color,
        customConfig: item.customConfig
      }));
      const { data } = await api.post('/orders', {
        orderItems,
        shippingAddress: { address, city, postalCode, country },
        paymentMethod: 'Razorpay',
        couponCode: appliedCoupon?.code, 
      });
      setIsOrderPlaced(true);
      clearCart();
      navigate(`/payment/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed');
    }
  };
  return (
    <div className="checkout-page page-container">
      <h2 className="mb-4" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>Checkout</h2>
      <div className="checkout-container">
        <div className="checkout-main">
          <div className="card mb-4">
            <h3 className="mb-3" style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>1. Delivery Address</h3>
            <div className="form-group">
              <label>Street Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
            <div className="form-row d-flex gap-3">
              <div className="form-group" style={{ flex: 1 }}>
                <label>City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Postal Code</label>
                <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
              </div>
            </div>
            <div className="form-group mb-0">
              <label>Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} required />
            </div>
          </div>
          <div className="card mb-4">
            <h3 className="mb-3" style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>2. Apply Coupon</h3>
            <div className="d-flex gap-2">
              <input 
                type="text" 
                value={couponCodeInput} 
                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())} 
                placeholder="Enter coupon code" 
                style={{ flex: 1 }}
              />
              <button className="btn btn-dark" onClick={applyCouponHandler}>Apply</button>
            </div>
            {couponError && <p className="text-danger mt-2 mb-0">✕ {couponError}</p>}
            {couponSuccess && appliedCoupon && (
              <div className="mt-3 p-3 d-flex justify-between align-center" style={{ backgroundColor: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <strong className="text-success">✓ {appliedCoupon.code} applied</strong>
                  <div className="text-success" style={{ fontSize: '0.9rem' }}>Discount: -₹{discountAmount.toFixed(2)}</div>
                </div>
                <button onClick={removeCouponHandler} className="btn btn-light" style={{ padding: '0.3rem 0.6rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                  Remove
                </button>
              </div>
            )}
            {availableCoupons.length > 0 && !appliedCoupon && (
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Available Coupons</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {availableCoupons.map(c => (
                    <li 
                      key={c.code} 
                      onClick={() => setCouponCodeInput(c.code)}
                      style={{ padding: '0.5rem 0', cursor: 'pointer', borderBottom: '1px dashed var(--color-border)' }}
                    >
                      <strong className="text-primary">{c.code}</strong> - Get {c.discountPercent}% off
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="card mb-4">
             <h3 className="mb-3" style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>3. Payment Method</h3>
             <div style={{ padding: '1rem', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-accent)', border: '4px solid white', boxShadow: '0 0 0 1px var(--color-accent)' }}></div>
                <strong>Razorpay (Credit Card, UPI, NetBanking)</strong>
             </div>
             <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>You will be redirected to the secure Razorpay payment gateway after clicking "Place Order".</p>
          </div>
        </div>
        <div>
          <div className="card sticky-summary">
            <h3 className="mb-3 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>Order Summary</h3>
            <div className="summary-items mb-3">
              {cartItems.map((item) => (
                <div key={item.uniqueId} className="summary-item">
                  <img src={item.image} alt={item.name} />
                  <div className="summary-item-details">
                    <p className="summary-item-name">{item.name}</p>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>{item.qty} x ₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="summary-item-total">₹{(item.qty * item.price).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{itemsPrice.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="summary-row text-danger">
                  <span>Discount:</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Shipping:</span>
                <span>₹{shippingPrice.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>₹{taxPrice.toFixed(2)}</span>
              </div>
              <div className="summary-row total mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                <span>Total:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <button className="btn btn-primary btn-block mt-4" onClick={placeOrderHandler}>
              Place Order & Pay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Checkout;
