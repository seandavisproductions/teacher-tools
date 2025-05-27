import React, { useState, useEffect, useRef } from "react";
import { Footer } from "./Footer";
import { TimerClock } from "./TimerClock";
import { useSocket } from './context/SocketContext'; // Import useSocket

// REMOVE: No longer needed here as socket comes from context
// const SOCKET_SERVER_URL = "https://teacher-toolkit-back-end.onrender.com";

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
  const [showPopoutSubtitles, setShowPopoutSubtitles] = useState(false); // State for pop-out visibility

  // REMOVE: No longer need socketRef as useSocket will provide the instance
  // const socketRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const lastServerSyncTimeRef = useRef(Date.now());
  const translationRequestTimeoutRef = useRef(null); // To debounce translation requests

  // Get the socket instance from context
  const socket = useSocket(); // <--- Get the socket here!

  // Effect to set up Socket.IO listeners
  useEffect(() => {
    // IMPORTANT: Ensure socket is available before setting up listeners
    if (!socket || !currentSessionCode) { // Ensure socket and session code are available
      console.warn("StudentView: Socket or sessionCode not available (yet).");
      return;
    }

    console.log('StudentView: Setting up Socket.IO listeners for session:', currentSessionCode);

    // No need for 'connect' listener here, as SocketProvider handles global connection
    // and initial joinSession.

    socket.on("timerUpdate", (data) => {
      console.log('StudentView: Received timerUpdate from server:', data);
      const { isRunning: serverIsRunning, timeLeft: serverTimeLeft } = data;

      setIsRunning(serverIsRunning);
      setTimeLeft(serverTimeLeft);
      lastServerSyncTimeRef.current = Date.now();

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      if (serverIsRunning && serverTimeLeft > 0) {
        timerIntervalRef.current = setInterval(() => {
          const elapsedTimeSinceLastSync = Math.floor((Date.now() - lastServerSyncTimeRef.current) / 1000);
          const newTimeLeft = Math.max(0, serverTimeLeft - elapsedTimeSinceLastSync); // Ensure non-negative

          if (newTimeLeft <= 0) {
            setTimeLeft(0);
            setIsRunning(false);
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          } else {
            setTimeLeft(newTimeLeft);
          }
        }, 1000);
      }
    });

    socket.on("timerReset", (data) => {
      console.log("StudentView: Received timer reset:", data);
      setTimeLeft(0);
      setIsRunning(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    });

    socket.on("objectiveUpdate", (objective) => {
      console.log("StudentView: Received objective update:", objective);
      setObjectiveText(objective);
    });

    // LISTENER NAME CHANGE: 'subtitleUpdate' -> 'subtitle'
    socket.on("subtitle", (data) => {
      console.log("StudentView: Received raw subtitle:", data);
      setCurrentSubtitle(data.text); // Always store raw text

      // Handle translation request for student view
      if (data.translation && data.translation.language === studentLanguage) {
        setTranslatedSubtitle(data.translation.text);
      } else if (data.isFinal) {
        requestTranslation(data.text, data.language, studentLanguage); // Pass source language from server
      } else {
        // Debounce requests for interim results
        if (translationRequestTimeoutRef.current) {
          clearTimeout(translationRequestTimeoutRef.current);
        }
        translationRequestTimeoutRef.current = setTimeout(() => {
          requestTranslation(data.text, data.language, studentLanguage); // Pass source language
        }, 300);
      }
    });

    // NEW LISTENER FOR STUDENT-SPECIFIC TRANSLATION RESPONSES
    socket.on("translatedSubtitleResponse", (translatedText) => {
      console.log("StudentView: Received translated subtitle response:", translatedText);
      setTranslatedSubtitle(translatedText);
    });

    socket.on("subtitleError", (message) => {
      console.error('StudentView: Subtitle error from server:', message);
      setTranslatedSubtitle(`Error: ${message}`);
    });

    // Cleanup function
    return () => {
      console.log("StudentView: Cleaning up Socket.IO listeners.");
      if (socket) {
        socket.off("timerUpdate");
        socket.off("timerReset");
        socket.off("objectiveUpdate");
        socket.off("subtitle"); // New event name
        socket.off("translatedSubtitleResponse"); // New event name
        socket.off("subtitleError");
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (translationRequestTimeoutRef.current) {
        clearTimeout(translationRequestTimeoutRef.current);
      }
      // NO LONGER call socket.disconnect() here! SocketProvider manages the global connection.
    };
  }, [socket, currentSessionCode, studentLanguage]); // Add `socket` to dependencies

  // Effect to join session room when currentSessionCode changes (if socket is ready)
  useEffect(() => {
    if (socket && socket.connected && currentSessionCode) {
      socket.emit("joinSession", currentSessionCode);
      console.log("StudentView: Emitted joinSession (code changed or socket connected):", currentSessionCode);
    }
  }, [socket, currentSessionCode]);

  // Function to request translation from the backend
  const requestTranslation = (text, sourceLanguageCode, targetLanguageCode) => {
      // IMPORTANT: Use the `socket` from `useSocket()` and check its availability
      if (socket && socket.connected && text && sourceLanguageCode && targetLanguageCode) {
          console.log(`StudentView: Requesting translation for "${text}" from ${sourceLanguageCode} to ${targetLanguageCode}`);
          socket.emit('requestStudentTranslation', { text, sourceLanguageCode, targetLanguageCode }); // NEW EVENT NAME for student request
      } else {
          console.warn('StudentView: Socket not connected or missing data for translation request.');
      }
  };

  // Validate the entered session code with the backend.
  const handleSubmit = async () => {
    console.log("StudentView: Input Code:", inputCode);
    try {
      // Note: The fetch call does not use socket, it's a regular HTTP request.
      const response = await fetch(`https://teacher-toolkit-back-end.onrender.com/session/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionCode: inputCode.trim() }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthorized(true);
        setCurrentSessionCode(inputCode.trim());
        // After successful validation and setting the code, the useEffect
        // with `[socket, currentSessionCode]` will emit 'joinSession' automatically.
      } else {
        alert(data.error || "Invalid code. Please try again.");
      }
    } catch (error) {
      console.error("StudentView: Error validating session code:", error);
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

  // Language options for students (Google Translate codes)
  const studentLanguageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'zh', label: 'Chinese (Simplified)' },
    { value: 'ko', label: 'Korean' },
    { value: 'ar', label: 'Arabic' },
    // Add more as needed, refer to Google Translate docs (ISO 639-1)
  ];


  return (
    <div>
      {!isAuthorized ? (
        <div className="student-login-container"> {/* Add a class for styling */}
          <img className="styled-image" src={`${process.env.PUBLIC_URL}/logo teacher toolkit.png`} alt="Teacher Toolkit"/>
          <h2>Enter Session Code</h2>
          <input
            type="text"
            className="input-code-box" // Add a class for styling
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="e.g., 0FNVTP"
          />
          <button className="submit-button" onClick={handleSubmit}>Join Session</button> {/* Add a class for styling */}
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
              {studentLanguageOptions.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
            {/* Toggle button for pop-out subtitles */}
            <button onClick={() => setShowPopoutSubtitles(!showPopoutSubtitles)}>
                {showPopoutSubtitles ? 'Hide Pop-out Subtitles' : 'Show Pop-out Subtitles'}
            </button>
            <div className="student-subtitle-inline-display"> {/* Inline display */}
                <p>Subtitles: {translatedSubtitle || "Waiting for teacher to speak..."}</p>
            </div>
          </div>

          {/* Pop-out Subtitle Display */}
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