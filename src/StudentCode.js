import { useState } from "react";
import { WebSocket } from "socket.io-client";
import { io } from "socket.io-client";
import { useEffect } from "react";
const socket = io("https://teacher-toolkit-back-end.onrender.com");



export function GenerateStudentCode({ teacherId }) {
    const [sessionCode, setSessionCode] = useState(""); // Stores the teacher-generated code
      // For entering a code manually (e.g., when a teacher has already generated one)
    const [inputCode, setInputCode] = useState("");


    useEffect(() => {
  console.log("Current sessionCode:", sessionCode);
}, [sessionCode]);
    // Listen for updates from the server (for example, if the teacher sends an update)
  useEffect(() => {
    socket.on("sessionUpdate", (data) => {
      console.log("Received session update:", data);
      // You could, for example, update sessionCode if sent from teacher
      if (data.sessionCode) setSessionCode(data.sessionCode);
    });
    return () => socket.off("sessionUpdate");
  }, []);
    
    const handleGenerateCode = async () => {
  const newCode = Math.random().toString(36).substr(2, 6).toUpperCase();
  setSessionCode(newCode);

  // Use teacherId from props
  try {
    const response = await fetch("https://teacher-toolkit-back-end.onrender.com/session/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: newCode, teacherId }),
    });
    if (!response.ok) {
      throw new Error("Failed to save session code");
    }
    // Optionally handle response data here
  } catch (err) {
    alert("Error saving session code to the server.");
    console.error(err);
  }

  sendUpdate(newCode, { message: "New session code created!" }); 
  // Also join the room so that subsequent updates are received
  joinRoom(newCode);
    }
      // Function to send an update via Socket.IO
    const sendUpdate = (sessionCode, newData) => {
      socket.emit("updateSession", { sessionCode, newData });
    };
    
     // Function to join a room named after the session code
  const joinRoom = (sessionCode) => {
    socket.emit("joinRoom", sessionCode);
    console.log(`Joined room: ${sessionCode}`);
  };

    // In case you want the student to manually enter a code and join it
  const handleJoinRoom = async () => {
    if (inputCode) {
      // Validate the code with the backend before joining the room
      try {
        const res = await fetch(`https://teacher-toolkit-back-end.onrender.com/session/validate/${inputCode}`);
        const data = await res.json();
        if (data.valid) {
          setSessionCode(inputCode);
          joinRoom(inputCode);
          // Optionally, show a success message or update UI
        } else {
          alert("Invalid or expired code. Please try again.");
        }
      } catch (err) {
        alert("Error validating code. Please try again later.");
        console.error(err);
      }
    }
  };

    const startTimer = (seconds) => {
      socket.emit("startCountdown", { sessionCode, duration: seconds });
    };
    
    
    const handleSessionUpdate = (newData) => {
      sendUpdate(sessionCode, newData);  // Now updates are sent!
    };
    
      return (
    <div>
      <button className="button" onClick={handleGenerateCode} id="1">
        {!sessionCode ? 'Generate Student Code' : `Student Code: ${sessionCode}`}
      </button>
    </div>
  );
}