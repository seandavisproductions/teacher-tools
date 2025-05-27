import { useState, useEffect } from "react";
import { Login } from "./Login";
import { useSocket } from './context/SocketContext';
// REMOVE: No longer needed here as socket is from context, and fetch doesn't use socket
// const SOCKET_SERVER_URL = 'https://teacher-toolkit-back-end.onrender.com';

export function GenerateStudentCode({ teacherId, sessionCode, setSessionCode, isAuthenticated, setIsAuthenticated, setteacherId }) {
  const [showLogin, setShowLogin] = useState(false);

  // Get the socket instance from context
  const socket = useSocket(); // <-- This is where you get the socket!

  const handleGenerateCode = async () => {
    try {
      const response = await fetch("https://teacher-toolkit-back-end.onrender.com/session/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to generate session code:", errorText);
        return;
      }

      const data = await response.json();
      setSessionCode(data.session?.code || data.sessionCode || "");

      // Emit an update to inform other connected clients (like students or other teacher views)
      // IMPORTANT: Check if socket is available and connected before emitting
      if (socket && socket.connected) {
        console.log(`GenerateStudentCode: Emitting updateSession for: ${data.session?.code}`);
        socket.emit("updateSession", { sessionCode: data.session?.code });
      } else {
        console.warn('GenerateStudentCode: Socket not connected, could not emit updateSession.');
      }

    } catch (error) {
      console.error("Error generating session code:", error);
    }
  };

  const handleButtonClick = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
    } else {
      handleGenerateCode();
    }
  };

  // Automatically fetch for a new session code if authenticated.
  useEffect(() => {
    if (isAuthenticated) {
      // Immediately fetch the code
      setShowLogin(false);
      handleGenerateCode();
    }
  }, [isAuthenticated, teacherId]); // Add handleGenerateCode to dependencies if it changes, though it's stable

  return (
    <div>
      <button className="button" onClick={handleButtonClick} id="1">
        {!sessionCode ? 'Generate Student Code (Requires Login)' : `Student Code: ${sessionCode}`}
      </button>

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