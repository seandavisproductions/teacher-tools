
const handleRegister = async () => {
    try {
      const response = await fetch("https://teacher-toolkit-back-end.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, teacherId }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Register Response:", data);

      if (data.success) {
        alert("Registration successful! Please login.");
        // Optionally navigate to login page if required:
        // navigate("/login");
      } else {
        alert("Registration failed! " + data.error);
      }
    } catch (error) {
      console.error("Register Error:", error.message);
    }
  };


export function Register() {
    return (   <div className="teacher-app">
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
        </div>)
}