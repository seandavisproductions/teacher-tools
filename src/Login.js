// src/Login.js
import React, { useState } from 'react';

// This component receives onAuthSuccess (which is handleAuthAndSessionSuccess from TeacherView)
export function Login({ onAuthSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. Authenticate the user
      const loginResponse = await fetch('https://teacher-toolkit-back-end.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const loginData = await loginResponse.json();
      console.log('Login Response:', loginData);

      if (loginData.token) {
        localStorage.setItem('token', loginData.token); // Store token for future authenticated calls

        // 2. Generate a session code after successful login
        const sessionResponse = await fetch('https://teacher-toolkit-back-end.onrender.com/session/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}` // Use the obtained token
            },
            body: JSON.stringify({ teacherId: loginData.teacherId }) // Pass the teacherId from login response
        });
        const sessionData = await sessionResponse.json();
        console.log('Session Generation Response:', sessionData);

        if (sessionData.sessionCode) {
            // Call the success handler: this will update TeacherView's state
            // and trigger SocketContext to join the session.
            onAuthSuccess(sessionData.sessionCode, loginData.teacherId);
        } else {
            console.error('Failed to generate session code:', sessionData.message);
            alert('Failed to generate session code: ' + sessionData.message);
        }
      } else {
        console.error('Login failed:', loginData.message);
        alert('Login failed: ' + loginData.message);
      }
    } catch (error) {
      console.error('Network or API error during login/session generation:', error);
      alert('An error occurred. Please check network and server.');
    }
  };

  return (
    <div className="login-container">
      <h3>Login to Get a Session Code</h3>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}