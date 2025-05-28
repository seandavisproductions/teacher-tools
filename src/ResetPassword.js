// src/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Assuming you use react-router-dom

const BACKEND_URL = "https://teacher-toolkit-back-end.onrender.com";

export function ResetPassword({ closeModal, onAuthSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  const location = useLocation(); // Hook to access URL query parameters
  const navigate = useNavigate(); // Hook to redirect after successful reset

  useEffect(() => {
    // Extract token from URL query parameters (e.g., ?token=XYZ)
    const queryParams = new URLSearchParams(location.search);
    const urlToken = queryParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError('No reset token found in the URL. Please use the link from your email.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
        setError('Cannot reset password without a valid token.');
        return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.message || 'Your password has been reset successfully! You can now log in with your new password.');
        // Optionally, if your backend sends back a token on reset, you could auto-login
        // if (data.token && data.userId && data.sessionCode) {
        //   localStorage.setItem('token', data.token);
        //   onAuthSuccess(data.sessionCode, data.userId);
        // } else {
            // Redirect to login page after a short delay
            setTimeout(() => {
                navigate('/login'); // Assuming you have a /login route
                closeModal(); // Close the reset modal if it was a modal
            }, 3000);
        // }
      } else {
        setError(data.message || 'Password reset failed. The link may be invalid or expired.');
      }
    } catch (err) {
      console.error('Password reset request error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  if (!token && !error) {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p>Loading...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="modal-overlay"> {/* Reusing your existing modal styles */}
      <button className="modal-close" onClick={closeModal}>X</button>
      <div className="modal-content">
        <h3>Reset Password</h3>
        {error ? (
          <p className="error-message">{error}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <p>Enter your new password.</p>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit">Reset Password</button>
            {message && <p className="success-message">{message}</p>}
          </form>
        )}
      </div>
    </div>
  );
}