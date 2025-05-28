// src/ForgotPassword.js
import React, { useState } from 'react';

const BACKEND_URL = "https://teacher-toolkit-back-end.onrender.com";

export function ForgotPassword({ closeModal }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.message || 'If an account with that email exists, a password reset link has been sent to your inbox.');
      } else {
        // We often give a generic success message even if email doesn't exist
        // to prevent email enumeration (telling attackers which emails are registered).
        // However, if your backend sends specific error messages, you can display them.
        setMessage(data.message || 'If an account with that email exists, a password reset link has been sent to your inbox.');
      }
    } catch (err) {
      console.error('Forgot password request error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="modal-overlay"> {/* Reusing your existing modal styles */}
      <button className="modal-close" onClick={closeModal}>X</button>
      <div className="modal-content">
        <h3>Forgot Password</h3>
        <form onSubmit={handleSubmit}>
          <p>Enter your email address to receive a password reset link.</p>
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}