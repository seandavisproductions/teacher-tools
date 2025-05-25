import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Footer } from "./Footer";
import { TimerClock } from "./TimerClock";

export const StudentView = ({ teacherId, setteacherId, sessionCode }) => {
  const socket = io("https://teacher-toolkit-back-end.onrender.com");
  const [inputCode, setInputCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Local time for the timer

  // Join the session room when a valid sessionCode is available.
  useEffect(() => {
    if (sessionCode) {
      socket.emit("joinSession", { sessionCode });
      
      // Listen for countdown updates from the server.
      socket.on("countdownUpdate", ({ timeLeft: updatedTime }) => {
        setTimeLeft(updatedTime);
      });

      return () => {
        socket.off("countdownUpdate");
      };
    }
  }, [sessionCode, socket]);

  // Validate the entered session code with the backend.
  const handleSubmit = async () => {
    console.log("Input Code:", inputCode);
    try {
      const response = await fetch("https://teacher-toolkit-back-end.onrender.com/session/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionCode: inputCode.trim() }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthorized(true);
      } else {
        alert(data.error || "Invalid code. Please try again.");
      }
    } catch (error) {
      console.error("Error validating session code:", error);
      alert("Error validating session code. Please try again.");
    }
  };

  return (
    <div>
      {!isAuthorized ? (
        <div>
          <h2>Enter Session Code</h2>
          <input 
            type="text" 
            value={inputCode} 
            onChange={(e) => setInputCode(e.target.value)}
          />
          <button onClick={handleSubmit}>Submit</button>
          {console.log(sessionCode)}
        </div>
      ) : (
        <div className="teacher-app">
          <h2>Welcome to the Student View!</h2>
          <img className="styled-image" src={`${process.env.PUBLIC_URL}/logo teacher toolkit.png`} alt="Teacher Toolkit"/>
          <Footer />
          {/* Pass the timeLeft down to TimerClock */}
          <TimerClock timeLeft={timeLeft} />
        </div>
      )}
    </div>
  );
};