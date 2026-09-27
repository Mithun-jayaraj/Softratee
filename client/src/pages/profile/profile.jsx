import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './profile.css';
const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
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
      setMobileNumber(user.mobileNumber || '');
      if (user.defaultAddress) {
        setAddress(user.defaultAddress.address || '');
        setCity(user.defaultAddress.city || '');
        setPostalCode(user.defaultAddress.postalCode || '');
        setCountry(user.defaultAddress.country || '');
      }
    }
  }, [user, navigate]);
  const submitHandler = async (e) => {
    e.preventDefault();
    const trimmedMobile = mobileNumber.trim();
    if (trimmedMobile && !/^\d{10}$/.test(trimmedMobile)) {
      setUpdateMessage({ text: 'Please enter a valid 10-digit mobile number', type: 'error' });
      return;
    }
    try {
      const { data } = await api.put('/auth/profile', {
        name,
        password,
        mobileNumber: trimmedMobile,
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
      <div className="container" style={{ padding: '2rem 1rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="mb-3" style={{ fontSize: '24px', fontWeight: 'bold' }}>PROFILE</h2>
        <div className="profile-content">
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
              <div className="form-group">
                <label>Mobile Number</label>
                <div style={{ display: 'flex' }}>
                  <span style={{ padding: '0.375rem 0.75rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRight: 'none', borderTopLeftRadius: 'var(--radius-sm)', borderBottomLeftRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>+91</span>
                  <input type="text" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" style={{ flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} />
                </div>
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
      </div>
    </div>
  );
};
export default Profile;
