import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import navigation
import { Register } from "./Register";

export default function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Create navigation function

const handleLogin = async () => {
  try {
    const response = await fetch("https://teacher-toolkit-back-end.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Login Response:", data); // Debugging output

    if (data.token) {
      setIsAuthenticated(true);
    } else {
      alert("Login failed! " + data.error);
    }
  } catch (error) {
    console.error("Login Error:", error.message);
  }
};


  return (
   <div className="teacher-app">
      <h1>Login</h1>
      <input
        className="input-text"
        type="text"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="input-text"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="button" onClick={handleLogin}>Login</button>
      <button className="button" onClick={() => navigate(<Register/>)}>Register</button>
    </div>
  );
}
