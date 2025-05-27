// src/Register.js  <-- This is the correct file path and component name
import React, { useState } from "react";
// import { useNavigate } from "react-router-dom"; // Probably not needed here anymore

// You don't need to import Login here if Register's internal backToLogin state
// is simply causing it to return the <Login /> component.
// However, if you're using this pattern, ensure Login is correctly imported.
// For clarity, I'm assuming Register *renders* Login when backToLogin is true.
import { Login } from "./Login";


export function Register({ /* closeModal, setIsAuthenticated */ }) { // Remove these props if not used
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [backToLogin, setBackToLogin] = useState(false); // Default to showing Register form first

  // This function toggles the view between Register and Login within the Register component itself
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
        // Parse error response if available from backend
        const errorData = await response.json();
        throw new Error(`Server error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.log("Register Response:", data);

      if (data.success) { // Assuming your backend sends { success: true }
        alert("Registration successful! Please login.");
        setBackToLogin(true); // Switch to the Login form after successful registration
      } else {
        alert("Registration failed! " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Register Error:", error.message);
      alert("Registration failed: " + error.message); // Show a user-friendly error
    }
  };


  return (backToLogin ?
  ( // If backToLogin is true, render the Login component
    <Login /* setIsAuthenticated={setIsAuthenticated} closeModal={closeModal} */ /> // Pass props if Login needs them
  ) : ( // Otherwise, render the Register form
    <div className="teacher-app">
      {/* closeModal button might be here if this was a modal */}
      {/* {closeModal && (
        <button className="modal-close" onClick={closeModal}>
          &times;
        </button>
      )} */}
      <h1>Register Your Username and Password</h1>
      <input
        className="input-text"
        type="text"
        placeholder="Username"
        value={username} // Controlled component
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="input-text"
        type="password"
        placeholder="Password"
        value={password} // Controlled component
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="button" onClick={handleRegister}>Submit</button>
      <button className="button" onClick={handleBackToLogin}>Back to login</button>
    </div>)
  );
}