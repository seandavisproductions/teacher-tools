import React, { useState, useEffect, useRef } from "react"; // Import useRef
import { io } from "socket.io-client";
import { Footer } from "./Footer";
import { TimerClock } from "./TimerClock";

// Define the Socket.IO server URL outside the component
const SOCKET_SERVER_URL = "https://teacher-toolkit-back-end.onrender.com";

export const StudentView = ({ sessionCode: propSessionCode }) => { // Rename prop to avoid conflict with state
  const [inputCode, setInputCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Local time for the timer
  const [currentSessionCode, setCurrentSessionCode] = useState(propSessionCode); // State to hold the session code
  const socketRef = useRef(null); // Use useRef to hold the socket instance

  // Effect to initialize socket connection once
  useEffect(() => {
    // Initialize socket only if it doesn't already exist
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_SERVER_URL, {
        withCredentials: true,
        // No need for extraHeaders: {"Access-Control-Allow-Origin": "*"} here.
        // CORS is handled by the server.
      });

      socketRef.current.on("connect", () => {
        console.log("Student socket connected!");
        // If we already have a sessionCode (e.g., passed as prop on initial load)
        if (currentSessionCode) {
          socketRef.current.emit("joinSession", currentSessionCode); // Send as string, not object
          console.log("Attempted to join session:", currentSessionCode);
        }
      });

      // Listen for countdown updates from the server.
      // Make sure this event name matches your backend's emit event (timerUpdate)
      socketRef.current.on("timerUpdate", (data) => { // Corrected event name
        console.log("Received timer update:", data);
        const { isRunning, timeLeft: updatedTime } = data;
        // Adjust local timeLeft if timer was running
        if (isRunning) {
            const timeSinceLastUpdate = Math.floor((Date.now() - socketRef.current._lastUpdateReceivedTime) / 1000) || 0;
            setTimeLeft(Math.max(0, updatedTime - timeSinceLastUpdate));
        } else {
            setTimeLeft(updatedTime);
        }
        socketRef.current._lastUpdateReceivedTime = Date.now(); // Store time of last update
      });

      // Listen for timer reset from the server
      socketRef.current.on("timerReset", (data) => {
        console.log("Received timer reset:", data);
        setTimeLeft(0);
        // Optionally update other states if your timer has them (e.g., isRunning)
      });

      socketRef.current.on("disconnect", () => {
        console.log("Student socket disconnected!");
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Student socket connection error:", err);
      });
    }

    // Cleanup function: Disconnect socket when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null; // Clear the ref
      }
    };
  }, []); // Empty dependency array: runs only once on mount

  // Effect to join session room when currentSessionCode changes
  // This will handle both initial prop and successful handleSubmit
  useEffect(() => {
    if (currentSessionCode && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("joinSession", currentSessionCode); // Send as string
      console.log("Re-attempted to join session (code changed or socket connected):", currentSessionCode);
    }
  }, [currentSessionCode]); // Dependent on currentSessionCode state

  // Validate the entered session code with the backend.
  const handleSubmit = async () => {
    console.log("Input Code:", inputCode);
    try {
      const response = await fetch(`${SOCKET_SERVER_URL}/session/validate`, { // Use SOCKET_SERVER_URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionCode: inputCode.trim() }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthorized(true);
        setCurrentSessionCode(inputCode.trim()); // Update session code state
        // The useEffect above will handle joining the socket room now
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
        </div>
      ) : (
        <div className="student-app"> {/* Changed to student-app class for clarity */}
          <h2>Welcome to the Student View!</h2>
          <img className="styled-image" src={`${process.env.PUBLIC_URL}/logo teacher toolkit.png`} alt="Teacher Toolkit"/>
          <Footer />
          {/* Pass the timeLeft down to TimerClock */}
          <TimerClock timeLeft={timeLeft} isRunning={true} /> {/* Assuming TimerClock might need isRunning too */}
        </div>
      )}
    </div>
  );
};