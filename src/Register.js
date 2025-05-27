// src/Register.js
import React, { useState } from "react";
import { Login } from "./Login"; // Ensure Login is imported

// Register now accepts onAuthAndSessionSuccess and closeModal from Header
export function Register({ onAuthAndSessionSuccess, closeModal }) { // No onSwitchToRegister needed here, as Register's Login doesn't need to switch UP
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [backToLogin, setBackToLogin] = useState(false); // Default to showing Register form first

  function handleBackToLogin() {
    setBackToLogin(true); // Set to true to show Login form
  }

  const handleRegister = async () => {
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    try {
      const response = await fetch("https://teacher-toolkit-back-end.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.log("Register Response:", data);

      if (data.success) {
        alert("Registration successful! Please login.");
        setBackToLogin(true); // Switch to the Login form after successful registration
      } else {
        alert("Registration failed! " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Register Error:", error.message);
      alert("Registration failed: " + error.message);
    }
  };

  return (backToLogin ?
  ( // If backToLogin is true, render the Login component
    <Login
        onAuthSuccess={onAuthAndSessionSuccess} // Pass the auth success handler to Login
        closeModal={closeModal} // Pass closeModal to Login if it needs it
        // Note: onSwitchToRegister is NOT passed here because Login being rendered by Register
        // doesn't need to ask Header to switch to Register (it's already Register being shown)
    />
  ) : ( // Otherwise, render the Register form
    <div className="teacher-app">
      {closeModal && ( // Only render close button if closeModal is provided
        <button className="modal-close" onClick={closeModal}>
          &times;
        </button>
      )}
      <h1>Register Your Username and Password</h1>
      <input
        className="input-text"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="input-text"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="button" onClick={handleRegister}>Submit</button>
      <button className="button" onClick={handleBackToLogin}>Back to login</button>
    </div>)
  );
}