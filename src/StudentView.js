import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Footer } from "./Footer";
import { TimerClock } from "./TimerClock";

// Define the Socket.IO server URL outside the component
const SOCKET_SERVER_URL = "https://teacher-toolkit-back-end.onrender.com";

export const StudentView = ({ sessionCode: propSessionCode }) => {
  const [inputCode, setInputCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Local time for the timer
  const [isRunning, setIsRunning] = useState(false); // New state to track if the timer is running
  const [currentSessionCode, setCurrentSessionCode] = useState(propSessionCode); // State to hold the session code

  const socketRef = useRef(null); // Use useRef to hold the socket instance
  const timerIntervalRef = useRef(null); // Ref to hold the local countdown interval ID
  const lastServerSyncTimeRef = useRef(Date.now()); // To track when the last timerUpdate was received

  // Effect to initialize socket connection once
  useEffect(() => {
    // Initialize socket only if it doesn't already exist
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_SERVER_URL, {
        withCredentials: true,
      });

      socketRef.current.on("connect", () => {
        console.log("Student socket connected!");
        // If we already have a sessionCode (e.g., passed as prop on initial load)
        if (currentSessionCode) {
          socketRef.current.emit("joinSession", currentSessionCode);
          console.log("Attempted to join session:", currentSessionCode);
        }
      });

      // Listen for timer updates from the server.
      socketRef.current.on("timerUpdate", (data) => {
        console.log("Received timer update:", data);
        const { isRunning: serverIsRunning, timeLeft: serverTimeLeft } = data;

        setIsRunning(serverIsRunning); // Update local isRunning state
        setTimeLeft(serverTimeLeft); // Update local timeLeft state
        lastServerSyncTimeRef.current = Date.now(); // Mark time of sync

        // If the server says the timer is running, start/reset local countdown interval
        if (serverIsRunning) {
          // Clear any existing interval to prevent duplicates or stale timers
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          // Start a new interval to count down locally
          timerIntervalRef.current = setInterval(() => {
            const elapsedTimeSinceLastSync = Math.floor((Date.now() - lastServerSyncTimeRef.current) / 1000);
            const newTimeLeft = serverTimeLeft - elapsedTimeSinceLastSync;

            if (newTimeLeft <= 0) {
              setTimeLeft(0);
              setIsRunning(false); // Timer has finished
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            } else {
              setTimeLeft(newTimeLeft);
            }
          }, 1000); // Update every second
        } else {
          // If server says it's paused or stopped, ensure our local timer also stops
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
        }
      });

      // Listen for timer reset from the server
      socketRef.current.on("timerReset", (data) => {
        console.log("Received timer reset:", data);
        setTimeLeft(0);
        setIsRunning(false); // Set isRunning to false on reset
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
      });

      socketRef.current.on("disconnect", () => {
        console.log("Student socket disconnected!");
        setIsRunning(false); // Stop local timer on disconnect
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Student socket connection error:", err);
      });
    }

    // Cleanup function: Disconnect socket and clear interval when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, []); // Empty dependency array: runs only once on mount

  // Effect to join session room when currentSessionCode changes or socket connects
  useEffect(() => {
    if (currentSessionCode && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("joinSession", currentSessionCode);
      console.log("Re-attempted to join session (code changed or socket connected):", currentSessionCode);
    }
  }, [currentSessionCode]);

  // Validate the entered session code with the backend.
  const handleSubmit = async () => {
    console.log("Input Code:", inputCode);
    try {
      const response = await fetch(`${SOCKET_SERVER_URL}/session/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionCode: inputCode.trim() }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthorized(true);
        setCurrentSessionCode(inputCode.trim()); // Update session code state
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
        <div className="student-app">
          <h2>Welcome to the Student View!</h2>
          <img className="styled-image" src={`${process.env.PUBLIC_URL}/logo teacher toolkit.png`} alt="Teacher Toolkit"/>
          <Footer />
          {/* Pass isRunning and timeLeft to TimerClock */}
          <TimerClock timeLeft={timeLeft} isRunning={isRunning} />
        </div>
      )}
    </div>
  );
};