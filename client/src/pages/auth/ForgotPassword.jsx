import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './auth.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.post('/auth/generate-otp', { email });
      setMessage('OTP sent to your registered email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.post('/auth/verify-otp', { email, otp });
      setMessage('OTP verified. You can now reset your password.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.post('/auth/reset-password', { email, newPassword: password });
      setMessage('Password reset successfully.');
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{step === 4 ? 'Password Reset Successful' : 'Forgot Password?'}</h2>
        
        {step === 1 && (
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            Enter your registered email address and we'll send you an OTP to reset your password.
          </p>
        )}
        
        {error && <div className="auth-error">{error}</div>}
        {message && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{message}</div>}
        
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label>Enter 6-digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="123456"
                maxLength="6"
              />
            </div>
            
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button 
                type="button" 
                onClick={(e) => handleSendOTP(e)} 
                disabled={loading} 
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
            </div>
            
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
              />
            </div>
            
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ margin: '2rem 0', color: '#10b981' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <Link to="/login" className="auth-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        )}
        
        {step !== 4 && (
          <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
            Remember your password? <Link to="/login">Back to Login</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
