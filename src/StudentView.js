import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Footer } from "./Footer";
import { TimerClock } from "./TimerClock";

const SOCKET_SERVER_URL = "https://teacher-toolkit-back-end.onrender.com";

export const StudentView = ({ sessionCode: propSessionCode }) => {
  const [inputCode, setInputCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentSessionCode, setCurrentSessionCode] = useState(propSessionCode);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Objective state
  const [objectiveText, setObjectiveText] = useState("");

  // Subtitle states
  const [currentSubtitle, setCurrentSubtitle] = useState(""); // Raw subtitle from teacher
  const [translatedSubtitle, setTranslatedSubtitle] = useState(""); // Translated subtitle for student
  const [studentLanguage, setStudentLanguage] = useState('en'); // Default student translation language (ISO 639-1 code)
  const [showPopoutSubtitles, setShowPopoutSubtitles] = useState(false); // NEW: State for pop-out visibility

  const socketRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const lastServerSyncTimeRef = useRef(Date.now());
  const translationRequestTimeoutRef = useRef(null); // To debounce translation requests

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

      socketRef.current.on("objectiveUpdate", (objective) => {
        console.log("Received objective update:", objective);
        setObjectiveText(objective);
      });

      socketRef.current.on("subtitleUpdate", (data) => {
        console.log("Student received raw subtitle:", data);
        setCurrentSubtitle(data.text);
        if (data.isFinal) {
            requestTranslation(data.text, studentLanguage);
        } else {
            if (translationRequestTimeoutRef.current) {
                clearTimeout(translationRequestTimeoutRef.current);
            }
            translationRequestTimeoutRef.current = setTimeout(() => {
                requestTranslation(data.text, studentLanguage);
            }, 300);
        }
      });

      socketRef.current.on("translatedSubtitle", (translatedText) => {
        console.log("Student received translated subtitle:", translatedText);
        setTranslatedSubtitle(translatedText);
      });

      socketRef.current.on("subtitleError", (message) => {
        console.error('Subtitle error from server:', message);
        setTranslatedSubtitle(`Error: ${message}`);
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
       if (translationRequestTimeoutRef.current) {
           clearTimeout(translationRequestTimeoutRef.current);
       }
    };
  }, [currentSessionCode, studentLanguage]);

  // Effect to join session room when currentSessionCode changes or socket connects
  useEffect(() => {
    if (currentSessionCode && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("joinSession", currentSessionCode);
      console.log("Re-attempted to join session (code changed or socket connected):", currentSessionCode);
    }
  }, [currentSessionCode]);

  // Function to request translation from the backend
  const requestTranslation = (text, targetLanguageCode) => {
      if (socketRef.current && text && targetLanguageCode) {
          socketRef.current.emit('requestTranslation', { text, targetLanguageCode });
      }
  };

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
          {/* Student Header */}
          <div className="header">
            <button onClick={toggleFullscreen} className="button-fullscreen">
              <img className="styled-image fullscreen" src={`${process.env.PUBLIC_URL}/FullScreen Logo.png`} alt="Fullscreen" />
            </button>
            <img className="styled-image logo" src={`${process.env.PUBLIC_URL}/logo teacher toolkit.png`} alt="Teacher Toolkit"/>
            {/* Display the objective text received from the teacher */}
            <div className="objective-display">
                <p>Objective: {objectiveText || "Waiting for teacher to set objective..."}</p>
            </div>
            <TimerClock timeLeft={timeLeft} isRunning={isRunning} />
          </div>

          {/* Student's Subtitle Area (always present but can be hidden via CSS if you prefer) */}
          <div className="student-subtitle-area">
            <select value={studentLanguage} onChange={(e) => setStudentLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              {/* Add more language options (ISO 639-1 codes) supported by Google Translate */}
            </select>
            {/* Toggle button for pop-out subtitles */}
            <button onClick={() => setShowPopoutSubtitles(!showPopoutSubtitles)}>
                {showPopoutSubtitles ? 'Hide Pop-out Subtitles' : 'Show Pop-out Subtitles'}
            </button>
            <div className="student-subtitle-inline-display"> {/* Inline display */}
                <p>Subtitles: {translatedSubtitle || "Waiting for teacher to speak..."}</p>
            </div>
          </div>

          {/* NEW: Pop-out Subtitle Display */}
          {showPopoutSubtitles && (
              <div className="popout-subtitle-container">
                  <p>{translatedSubtitle || "Waiting for teacher to speak..."}</p>
                  {/* Optionally, you could add a close button here */}
                  {/* <button onClick={() => setShowPopoutSubtitles(false)}>X</button> */}
              </div>
          )}

          {/* Other student view content */}
          <p>Welcome to the Student View for session: **{currentSessionCode}**</p>

          <Footer />
        </div>
      )}
    </div>
  );
};