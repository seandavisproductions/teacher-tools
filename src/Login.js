// src/Login.js
import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const BACKEND_URL = "https://teacher-toolkit-back-end.onrender.com";

export function Login({ onAuthSuccess, closeModal, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.userId && data.sessionCode) {
        localStorage.setItem('token', data.token);
        onAuthSuccess(data.sessionCode, data.userId);
      } else {
        if (data.message === "Email not verified") {
            setError("Your email is not verified. Please check your inbox or click 'Resend Verification Email'.");
        } else {
            setError(data.message || 'Login failed. Please check your credentials.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } // <--- THIS IS THE FIX: Changed '.' to '}'
  };

  // --- Google Sign-In Success Handler ---
  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Google login successful:", credentialResponse);
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
        onAuthSuccess(data.sessionCode, data.userId);
      } else {
        setError(data.message || 'Google login failed on server. Please try again.');
      }
    } catch (err) {
      console.error('Error sending Google ID token to backend:', err);
      setError('An error occurred during Google sign-in. Please try again.');
    }
  };

  // --- Google Sign-In Error Handler ---
  const handleGoogleError = () => {
    console.error("Google login failed. Check console for details.");
    setError("Google login failed. Please try again or use email/password.");
  };

  // --- Forgot Password Handler ---
  const handleForgotPassword = () => {
      alert("Forgot Password functionality needs backend integration. You would send an email here.");
      console.log("Forgot Password clicked. Implement modal/page to ask for email.");
  };

  return (
    <div className="modal-overlay">
      <button className="modal-close" onClick={closeModal}>X</button>
      <div className="modal-content">
        <h3>Login</h3>
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
          <button className="button"type="submit">Login</button>
          {error && <p className="error-message">{error}</p>}
        </form>

        <p className="">
          <a href="#" onClick={handleForgotPassword}>Forgot Password?</a>
        </p>

        <div className="auth-separator">OR</div>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          render={renderProps => (
            <button
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
              className="button google-sign-in-button"
            >
              Sign in with Google
            </button>
          )}
        />

        <p className="register-link-container">
          Don't have an account? <button type="button" onClick={onSwitchToRegister}>Register</button>
        </p>
      </div>
    </div>
  );
}