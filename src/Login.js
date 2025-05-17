import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import navigation

export default function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Create navigation function

  const handleLogin = async () => {
    const response = await fetch("https://teacher-toolkit-back-end.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (data.token) {
      setIsAuthenticated(true);
      navigate("/teacher-dashboard"); // Redirect after login
    } else {
      alert("Login failed!");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
