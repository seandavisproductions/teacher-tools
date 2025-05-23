import { useState } from "react";
import { io } from "socket.io-client";
import { Footer } from "./Footer";

export const StudentView = ({ teacherId, setteacherId, timeLeft }) => {
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


  const handleSubmit = () => {
    if (inputCode === teacherId) {
      setIsAuthorized(true);
    } else {
      alert("Invalid code. Please try again.");
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
        </div>
      ) : (
        <div>
        <h2>Welcome to the Student View!</h2>
        <Footer />
        <p className="digital-clock">{(timeLeft)}</p>
        </div>
      )}
    </div>
  );
};
