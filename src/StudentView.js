import { useState } from "react";
import { io } from "socket.io-client";
import { Footer } from "./Footer";
import { TimerClock } from "./TimerClock";

export const StudentView = ({ teacherId, setteacherId, timeLeft, sessionCode }) => {
  const socket = io("https://teacher-toolkit-back-end.onrender.com");
  const [inputCode, setInputCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const updateStudentDashboard = (data) => {
  console.log("Updating student view with:", data);
};

socket.on("sessionUpdate", (data) => {
  console.log("Received update from teacher:", data);
  updateStudentDashboard(data);
});


const handleSubmit = async () => {
    console.log("Input Code:", inputCode);
    try {
      // Send the entered code to the secure endpoint for validation
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
        <div>
        <h2>Welcome to the Student View!</h2>
        <Footer />
        <TimerClock/>
        </div>
      )}
      
    </div>
    
  );
};
