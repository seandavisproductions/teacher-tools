import { useState } from "react";
import { Register } from "./Register";
import { LoadingSpinner } from "./LoadingSpinner";

export function Login({ setIsAuthenticated, teacherId, setteacherId }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [register, setRegister] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  
  
 // For Google login, simply redirect to your backend route.
  const handleGoogleLogin = () => {
    window.location.href = "https://teacher-toolkit-back-end.onrender.com/auth/google";
  };

const handleLogin = async () => {
  setIsLoading(true);
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
      // In your login handler, after a successful login:
      setteacherId(data.teacherId); // data.teacherId comes from your backend login response
      console.log(teacherId)
    } else {
      alert("Login failed! " + data.error);
    }
  } catch (error) {
    console.error("Login Error:", error.message);
  } finally {
      setIsLoading(false);
    }
};

function handleRegisterPage() {
setRegister(!register)
}

return isLoading ? (
  <LoadingSpinner />
) : (
  !register ? (
    <div className="teacher-app">
      <h1>Login</h1>
      <input
        className="input-text"
        type="text"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleLogin();
        }}
      />
      <input
        className="input-text"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleLogin();
        }}
      />
      <button className="button" onClick={handleLogin} onKeyDown={(e) => {
          if (e.key === "Enter") handleLogin();
        }}>Login</button>
      <button className="button" onClick={handleRegisterPage}>Register</button>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  ) : (
    <Register setIsAuthenticated={setIsAuthenticated} />
  )
);
}
