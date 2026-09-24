import React, { useContext, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import api from '../../services/api';
import './cart.css';
const Cart = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const qty = searchParams.get('qty') ? Number(searchParams.get('qty')) : 1;
  const size = searchParams.get('size') || '';
  const color = searchParams.get('color') || '';
  const customConfigStr = searchParams.get('custom');
  const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (id) {
      const fetchProductAndAdd = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          const matchedColor = data.colors?.find(c => c.name === color || c.hex === color);
          const cartImage = matchedColor?.image || data.image;
          addToCart({
            product: data._id,
            name: data.name,
            image: cartImage,
            price: data.price,
            countInStock: data.countInStock,
            qty,
            size,
            color: matchedColor?.name || color,
            colorHex: matchedColor?.hex || color,
            customConfig: customConfigStr
          });
          navigate('/cart');
        } catch (err) {
          console.error(err);
        }
      };
      fetchProductAndAdd();
    }
  }, [id, qty, size, color, customConfigStr, addToCart, navigate]);
  const checkoutHandler = () => {
    navigate('/login?redirect=checkout');
  };
  return (
    <div className="cart-page">
      <h2>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <div className="empty-cart-container">
          <ShoppingCart className="empty-cart-icon" size={56} strokeWidth={1.5} />
          <h3 className="empty-cart-title">Your cart is empty</h3>
          <p className="empty-cart-subtitle">You haven't added anything to your cart yet.</p>
          <p className="empty-cart-text">Browse our collection and find your next favorite T-shirt.</p>
          <Link to="/products" className="btn btn-primary empty-cart-btn">Continue Shopping</Link>
        </div>
      ) : (
        <div className="cart-container">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.uniqueId} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <Link to={`/product/${item.product}`}>{item.name}</Link>
                  <p className="item-price">₹{item.price.toFixed(2)}</p>
                  {item.size && <p>Size: {item.size}</p>}
                  {item.color && (
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Color: 
                      <span style={{ width: '15px', height: '15px', backgroundColor: item.colorHex || item.color, display: 'inline-block', borderRadius: '50%', border: '1px solid #ccc' }}></span>
                      {item.color}
                    </p>
                  )}
                  {item.customConfig && (
                    <p className="custom-badge">Customized Design</p>
                  )}
                </div>
                <div className="item-qty">
                  <select
                    value={item.qty}
                    onChange={(e) => addToCart({ ...item, qty: Number(e.target.value) })}
                  >
                    {[...Array(item.countInStock).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="item-remove">
                  <button onClick={() => removeFromCart(item.uniqueId)} className="btn btn-danger btn-sm">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>
              Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items
            </h3>
            <p className="total-price">
              ₹{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
            </p>
            <button
              className="btn btn-primary btn-block"
              disabled={cartItems.length === 0}
              onClick={checkoutHandler}
            >
              Proceed To Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Cart;
