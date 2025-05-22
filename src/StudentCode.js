import { useState } from "react";
import { WebSocket } from "socket.io-client";
import { io } from "socket.io-client";
import { useEffect } from "react";
const socket = io("https://teacher-toolkit-back-end.onrender.com");



export function GenerateStudentCode() {
    const [sessionCode, setSessionCode] = useState(""); // Stores the teacher-generated code
      // For entering a code manually (e.g., when a teacher has already generated one)
    const [inputCode, setInputCode] = useState("");

    // Listen for updates from the server (for example, if the teacher sends an update)
  useEffect(() => {
    socket.on("sessionUpdate", (data) => {
      console.log("Received session update:", data);
      // You could, for example, update sessionCode if sent from teacher
      if (data.sessionCode) setSessionCode(data.sessionCode);
    });
    return () => socket.off("sessionUpdate");
  }, []);
    
    const handleGenerateCode = () => {
    const newCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    setSessionCode(newCode);
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
  const handleJoinRoom = () => {
    if (inputCode) {
      setSessionCode(inputCode);
      joinRoom(inputCode);
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
      <div style={{ marginTop: "1rem" }}>
        <input
          className="input-text"
          type="text"
          placeholder="Enter session code"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
        />
        <button className="button" onClick={handleJoinRoom}>
          Join Session
        </button>
      </div>
    </div>
  );
}