import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Footer } from "./Footer";
import { TimerClock } from "./TimerClock"; // Assuming you have this
// import { ObjectiveBox } from './ObjectiveBox'; // If you create a separate component for it

// Define the Socket.IO server URL outside the component
const SOCKET_SERVER_URL = "https://teacher-toolkit-back-end.onrender.com";

export const StudentView = ({ sessionCode: propSessionCode }) => {
  const [inputCode, setInputCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentSessionCode, setCurrentSessionCode] = useState(propSessionCode);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Objective state
  const [objectiveText, setObjectiveText] = useState(""); // <-- NEW: State for objective

  const socketRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const lastServerSyncTimeRef = useRef(Date.now());

  // Effect to initialize socket connection once
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_SERVER_URL, {
        withCredentials: true,
      });

      socketRef.current.on("connect", () => {
        console.log("Student socket connected!");
        if (currentSessionCode) {
          socketRef.current.emit("joinSession", currentSessionCode);
        }
      });

      socketRef.current.on("timerUpdate", (data) => {
        console.log("Received timer update:", data);
        const { isRunning: serverIsRunning, timeLeft: serverTimeLeft } = data;

        setIsRunning(serverIsRunning);
        setTimeLeft(serverTimeLeft);
        lastServerSyncTimeRef.current = Date.now();

        if (serverIsRunning) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          timerIntervalRef.current = setInterval(() => {
            const elapsedTimeSinceLastSync = Math.floor((Date.now() - lastServerSyncTimeRef.current) / 1000);
            const newTimeLeft = serverTimeLeft - elapsedTimeSinceLastSync;

            if (newTimeLeft <= 0) {
              setTimeLeft(0);
              setIsRunning(false);
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            } else {
              setTimeLeft(newTimeLeft);
            }
          }, 1000);
        } else {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
        }
      });

      socketRef.current.on("timerReset", (data) => {
        console.log("Received timer reset:", data);
        setTimeLeft(0);
        setIsRunning(false);
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      });

      // <-- NEW: Listen for objective updates from the server
      socketRef.current.on("objectiveUpdate", (objective) => {
        console.log("Received objective update:", objective);
        setObjectiveText(objective);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Student socket disconnected!");
        setIsRunning(false);
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Student socket connection error:", err);
      });
    }

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
  }, []);

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
        setCurrentSessionCode(inputCode.trim());
      } else {
        alert(data.error || "Invalid code. Please try again.");
      }
    } catch (error) {
      console.error("Error validating session code:", error);
      alert("Error validating session code. Please try again.");
    }
  };

  // Fullscreen function for student view
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

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
          {/* NEW: Student Header */}
          <div className="header"> {/* Use the same class as teacher's header for styling */}
            <button onClick={toggleFullscreen} className="button-fullscreen">
              <img className="styled-image fullscreen" src={`${process.env.PUBLIC_URL}/FullScreen Logo.png`} alt="Fullscreen" />
            </button>
            <img className="styled-image logo" src={`${process.env.PUBLIC_URL}/logo teacher toolkit.png`} alt="Teacher Toolkit"/>
            {/* Display the objective text received from the teacher */}
            <div className="objective-display">
                <p>Objective: {objectiveText || "Waiting for teacher to set objective..."}</p>
            </div>
            {/* NEW: TimerClock directly in the header area if you want it prominent */}
            <TimerClock timeLeft={timeLeft} isRunning={isRunning} />
          </div>

          {/* Other student view content can go here if needed */}
          <p>Welcome to the Student View for session: **{currentSessionCode}**</p> {/* Display session code */}


          <Footer />
        </div>
      )}
    </div>
  );
};