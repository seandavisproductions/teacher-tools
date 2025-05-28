// src/Register.js
import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const BACKEND_URL = "https://teacher-toolkit-back-end.onrender.com";

export function Register({ onAuthAndSessionSuccess, closeModal, onSwitchToLogin }) { // <-- ADD onSwitchToLogin prop
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.message || 'Registration successful! Please check your email to verify your account.');
        // If your backend automatically logs in/creates a session after verification,
        // you would call onAuthAndSessionSuccess here. For now, assuming email verification.
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleResendVerification = async () => {
      setMessage(null);
      setError(null);
      if (!email) {
          setError("Please enter your email to resend the verification link.");
          return;
      }
      try {
          const response = await fetch(`${BACKEND_URL}/auth/resend-verification`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
          });
          const data = await response.json();
          if (response.ok && data.success) {
              setMessage(data.message || 'Verification email sent! Please check your inbox.');
          } else {
              setError(data.message || 'Failed to resend verification email. ' + (data.message || ''));
          }
      } catch (err) {
          console.error('Resend verification error:', err);
          setError('Error sending verification email. Please try again later.');
      }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Google sign-up/login successful:", credentialResponse);
    const idToken = credentialResponse.credential;

    try {
      const response = await fetch(`${BACKEND_URL}/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.userId && data.sessionCode) {
        localStorage.setItem('token', data.token);
        onAuthAndSessionSuccess(data.sessionCode, data.userId);
      } else {
        setError(data.message || 'Google sign-up failed on server. Please try again.');
      }
    } catch (err) {
      console.error('Error sending Google ID token to backend for sign-up:', err);
      setError('An error occurred during Google sign-up. Please try again.');
    }
  };

  const handleGoogleError = () => {
    console.error("Google sign-up failed. Check console for details.");
    setError("Google sign-up failed. Please try again.");
  };

  return (
    <div className="modal-overlay">
      <button className="modal-close" onClick={closeModal}>X</button>
      <div className="modal-content">
        <h3>Register</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Register</button>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
        </form>

        {/* Resend Verification Email Link */}
        <p className="resend-verification-link">
          <a href="#" onClick={handleResendVerification}>Resend Verification Email</a>
        </p>

        <div className="auth-separator">OR</div>

        {/* Google Sign-Up Button with custom class */}
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          render={renderProps => (
            <button
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
              className="button google-sign-in-button" // Your specified class
            >
              Sign up with Google
            </button>
          )}
        />

        {/* Already have an account? Login link */}
        <p className="login-link-container"> {/* New class for potential styling */}
          Already have an account? <button type="button" onClick={onSwitchToLogin}>Login</button> {/* NEW onSwitchToLogin prop */}
        </p>
      </div>
    </div>
  );
}