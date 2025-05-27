// src/Login.js
import React, { useState } from 'react';

// Added onSwitchToRegister prop
export function Login({ onAuthSuccess, closeModal, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    // ... (Your existing login logic) ...
    // After successful login and session generation, call onAuthSuccess(sessionCode, teacherId);
    // ...
  };

  return (
    <div className="login-container">
      {closeModal && ( // If you use a modal, keep this
        <button className="modal-close" onClick={closeModal}>
          &times;
        </button>
      )}
      <h3>Login to Get a Session Code</h3>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      {/* Button to switch to the Register form */}
      <button className="button" onClick={onSwitchToRegister}>
        Don't have an account? Register
      </button>
    </div>
  );
}