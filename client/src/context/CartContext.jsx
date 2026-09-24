import React, { createContext, useState, useEffect } from 'react';
export const CartContext = createContext();
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  useEffect(() => {
    const items = localStorage.getItem('cartItems');
    if (items) setCartItems(JSON.parse(items));
    const address = localStorage.getItem('shippingAddress');
    if (address) setShippingAddress(JSON.parse(address));
  }, []);
  const addToCart = (item) => {
    const uniqueId = item.product + (item.customConfig || '') + item.size + item.color;
    const existingItemIndex = cartItems.findIndex(x => x.uniqueId === uniqueId);
    let newCartItems;
    if (existingItemIndex >= 0) {
      newCartItems = [...cartItems];
      newCartItems[existingItemIndex].qty = item.qty;
    } else {
      newCartItems = [...cartItems, { ...item, uniqueId }];
    }
    setCartItems(newCartItems);
    localStorage.setItem('cartItems', JSON.stringify(newCartItems));
  };
  const removeFromCart = (uniqueId) => {
    const newCartItems = cartItems.filter((x) => x.uniqueId !== uniqueId);
    setCartItems(newCartItems);
    localStorage.setItem('cartItems', JSON.stringify(newCartItems));
  };
  const saveShippingAddress = (data) => {
    setShippingAddress(data);
    localStorage.setItem('shippingAddress', JSON.stringify(data));
  };
  const savePaymentMethod = (data) => {
    setPaymentMethod(data);
    localStorage.setItem('paymentMethod', JSON.stringify(data));
  };
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };
  return (
    <CartContext.Provider
      value={{
        cartItems,
        shippingAddress,
        paymentMethod,
        addToCart,
        removeFromCart,
        saveShippingAddress,
        savePaymentMethod,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
