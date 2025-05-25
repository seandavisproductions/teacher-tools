import { useState, useEffect } from "react";
import { Login } from "./Login";
import { io } from "socket.io-client";
const socket = io("https://teacher-toolkit-back-end.onrender.com");

export function GenerateStudentCode({ teacherId, sessionCode, setSessionCode, isAuthenticated, setIsAuthenticated, setteacherId }) {
  const [showLogin, setShowLogin] = useState(false);

  const handleGenerateCode = async () => {
    try {
      const response = await fetch("https://teacher-toolkit-back-end.onrender.com/session/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send only teacherId to the server for generating the session code
        body: JSON.stringify({ teacherId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to generate session code:", errorText);
        return;
      }

      const data = await response.json();
      // Assume your backend returns the generated code under data.session.code
      setSessionCode(data.session?.code || data.sessionCode || "");

      // Optionally, emit an update to inform other connected clients
      socket.emit("updateSession", { sessionCode: data.session?.code });
    } catch (error) {
      console.error("Error generating session code:", error);
    }
  };

  // If not authenticated, show the Login component via button click.
  const handleButtonClick = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
    } else {handleGenerateCode()}
  };

   // Automatically poll for a new session code if authenticated.
  useEffect(() => {
    if (isAuthenticated) {
      // Immediately fetch the code
      setShowLogin(false)
      handleGenerateCode()
    }
  }, [isAuthenticated, teacherId]);

  return (
     <div>
      <button className="button" onClick={handleButtonClick} id="1">
        {!sessionCode ? 'Generate Student Code (Requires Login)' : `Student Code: ${sessionCode}`}
      </button>
      
      {/* When showLogin is true, render the modal overlay */}
      {showLogin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <Login 
              setIsAuthenticated={setIsAuthenticated} 
              teacherId={teacherId} 
              setteacherId={setteacherId}
              closeModal={() => setShowLogin(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}