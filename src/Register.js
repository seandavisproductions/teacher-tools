import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Login } from "./Login";


export function Register({setIsAuthenticated}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [backToLogin, setBackToLogin] = useState(true)
  

  function handleBackToLogin() {
setBackToLogin(!backToLogin)

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
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Register Response:", data);

      if (!data.success) {
        alert("Registration successful! Please login.");
        // Optionally navigate to login page if required:
        // navigate("/login");
        setTimeout(() => {
          setBackToLogin(true);
        }, 2000);
        console.log("It worked")
      } else {
        alert("Registration failed! " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Register Error:", error.message);
    }
  };


  return (backToLogin ? 
  (  <div className="teacher-app">
      <h1>Register Your Username and Password</h1>
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

      <button className="button" onClick={handleRegister}>Submit</button>
      <button className="button" onClick={handleBackToLogin}>Back to login</button>
    </div>) : (<Login setIsAuthenticated={setIsAuthenticated} />)
  )
}




