// src/StudentView.js
import React, { useState, useEffect, useRef } from "react";
import { Footer } from "./Footer";
import { TimerClock } from "./TimerClock";
import { useSocket, SocketContext } from './context/SocketContext';
const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'; // Define it at the top with other constants

export const StudentView = ({ sessionCode: propSessionCode, onResetRole }) => {
  console.log("StudentView: Initializing with propSessionCode:", propSessionCode);
  const [inputCode, setInputCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [objectiveText, setObjectiveText] = useState("");
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [translatedSubtitle, setTranslatedSubtitle] = useState("");
  const [studentLanguage, setStudentLanguage] = useState('en');
  const [showPopoutSubtitles, setShowPopoutSubtitles] = useState(false);

  const timerIntervalRef = useRef(null);
  const lastServerSyncTimeRef = useRef(Date.now());
  const translationRequestTimeoutRef = useRef(null);

  // Get socket and context safely
  let socket = null;
  let updateSessionCodeForSocket = null;
  let contextTimeLeft = 0;
  let contextIsRunning = false;
  
  try {
    socket = useSocket();
    const context = React.useContext(SocketContext);
    if (context) {
      updateSessionCodeForSocket = context.updateSessionCodeForSocket;
      contextTimeLeft = context.timeLeft;
      contextIsRunning = context.isTimerRunning;
    }
  } catch (error) {
    console.warn("StudentView: Error accessing socket or context:", error.message);
  }
  
  const [currentSessionCode, setCurrentSessionCode] = useState(propSessionCode);
  
  // Handle prop session code changes
  useEffect(() => {
    if (propSessionCode) {
      setCurrentSessionCode(propSessionCode);
      setIsAuthorized(true);
      // Also update the session code in the socket context
      if (updateSessionCodeForSocket) {
        updateSessionCodeForSocket(propSessionCode);
      }
    }
  }, [propSessionCode, updateSessionCodeForSocket]);

  useEffect(() => {
    if (!socket) {
      console.warn("StudentView: Socket not available (yet).");
      return;
    }
    
    if (!currentSessionCode) {
      console.warn("StudentView: Session code not available (yet).");
      return;
    }

    console.log('StudentView: Setting up Socket.IO listeners for session:', currentSessionCode);

    socket.on("timerState", (data) => {
      console.log('StudentView: Received timerState from server:', data);
      // Handle both timeLeft and remainingTime formats
      const serverTimeLeft = data.remainingTime ? Math.floor(data.remainingTime / 1000) : data.timeLeft;
      const serverIsRunning = data.isRunning;

      setIsRunning(serverIsRunning);
      setTimeLeft(serverTimeLeft);
      lastServerSyncTimeRef.current = Date.now();

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      if (serverIsRunning && serverTimeLeft > 0) {
        timerIntervalRef.current = setInterval(() => {
          const elapsedTimeSinceLastSync = Math.floor((Date.now() - lastServerSyncTimeRef.current) / 1000);
          const newTimeLeft = Math.max(0, serverTimeLeft - elapsedTimeSinceLastSync);

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

    socket.on("timerUpdate", (data) => {
      console.log('StudentView: Received timerUpdate from server:', data);
      // Handle both timeLeft and remainingTime formats
      const serverTimeLeft = data.remainingTime ? Math.floor(data.remainingTime / 1000) : data.timeLeft;
      const serverIsRunning = data.isRunning;

      setIsRunning(serverIsRunning);
      setTimeLeft(serverTimeLeft);
      lastServerSyncTimeRef.current = Date.now();

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      if (serverIsRunning && serverTimeLeft > 0) {
        timerIntervalRef.current = setInterval(() => {
          const elapsedTimeSinceLastSync = Math.floor((Date.now() - lastServerSyncTimeRef.current) / 1000);
          const newTimeLeft = Math.max(0, serverTimeLeft - elapsedTimeSinceLastSync);

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

    socket.on("subtitle", (data) => {
      console.log("StudentView: Received raw subtitle:", data);
      setCurrentSubtitle(data.text);

      if (data.translation && data.translation.language === studentLanguage) {
        setTranslatedSubtitle(data.translation.text);
      } else if (data.isFinal) {
        requestTranslation(data.text, data.language, studentLanguage);
      } else {
        if (translationRequestTimeoutRef.current) {
          clearTimeout(translationRequestTimeoutRef.current);
        }
        translationRequestTimeoutRef.current = setTimeout(() => {
          requestTranslation(data.text, data.language, studentLanguage);
        }, 300);
      }
    });

    socket.on("translatedSubtitleResponse", (translatedText) => {
      console.log("StudentView: Received translated subtitle response:", translatedText);
      setTranslatedSubtitle(translatedText);
    });

    socket.on("subtitleError", (message) => {
      console.error('StudentView: Subtitle error from server:', message);
      setTranslatedSubtitle(`Error: ${message}`);
    });

    return () => {
      console.log("StudentView: Cleaning up Socket.IO listeners.");
      if (socket) {
        socket.off("timerState");
        socket.off("timerUpdate");
        socket.off("timerReset");
        socket.off("objectiveUpdate");
        socket.off("subtitle");
        socket.off("translatedSubtitleResponse");
        socket.off("subtitleError");
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (translationRequestTimeoutRef.current) {
        clearTimeout(translationRequestTimeoutRef.current);
      }
    };
  }, [socket, currentSessionCode, studentLanguage]);

  useEffect(() => {
    if (socket && socket.connected && currentSessionCode && updateSessionCodeForSocket) {
      // Use the context function to update the session code
      updateSessionCodeForSocket(currentSessionCode);
      console.log("StudentView: Updated session code in context:", currentSessionCode);
      
      // Request current timer state
      setTimeout(() => {
        if (socket && socket.connected) {
          console.log("StudentView: Requesting timer state for session:", currentSessionCode);
          socket.emit('requestTimerState', { sessionCode: currentSessionCode });
        }
      }, 500);
    }
  }, [socket, currentSessionCode, updateSessionCodeForSocket]);

  const requestTranslation = (text, sourceLanguageCode, targetLanguageCode) => {
      if (socket && socket.connected && text && sourceLanguageCode && targetLanguageCode) {
          console.log(`StudentView: Requesting translation for "${text}" from ${sourceLanguageCode} to ${targetLanguageCode}`);
          socket.emit('requestStudentTranslation', { text, sourceLanguageCode, targetLanguageCode });
      } else {
          console.warn('StudentView: Socket not connected or missing data for translation request.');
      }
  };

    const handleSubmit = async () => {
    console.log("StudentView: Input Code:", inputCode);
    try {
      // --- USE IT HERE IN THE FETCH CALL ---
      const response = await fetch(`${BACKEND_API_URL}/session/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionCode: inputCode.trim() }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const validCode = inputCode.trim();
        setIsAuthorized(true);
        setCurrentSessionCode(validCode);
        // Also update the session code in the socket context
        updateSessionCodeForSocket(validCode);
      } else {
        alert(data.error || "Invalid code. Please try again.");
      }
    } catch (error) {
      console.error("StudentView: Error validating session code:", error);
      alert("Error validating session code. Please try again.");
    }
  };

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

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
  ];


  return (
    <div>
      {/* NEW: Place the Change Role button here, accessible in both views */}
      {onResetRole && (
        <div className="countdown-container">
          <button onClick={onResetRole} className="button">
              Change Role
          </button>
           <p>Welcome to the Student View for session: **{currentSessionCode}**</p>
          </div>
      )}

      {!isAuthorized ? (
        <div className="teacher-app">
          <img className="styled-image" src={`${process.env.PUBLIC_URL}/logo_teacher_toolkit.png`} alt="Teacher Toolkit"/>
          <h2>Enter Session Code</h2>
          
          <input
            type="text"
            className="input-box"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="e.g., 0FNVTP"
          />
          <button className="button" onClick={handleSubmit}>Join Session</button>
        </div>
      ) : (
        <div className="student-app">
         
          {/* Student Header - you might want to consider extracting this into its own component later */}
          <div className="header">
            <button onClick={toggleFullscreen} className="button-fullscreen">
              <img className="styled-image fullscreen" src={`${process.env.PUBLIC_URL}/FullScreen_Logo.png`} alt="Fullscreen" />
            </button>
            <img className="styled-image logo" src={`${process.env.PUBLIC_URL}/teacher_toolkit_logo_only.png`} alt="Teacher Toolkit"/>
            <div className="objective-box">
                <h2>Objective: {objectiveText || "Waiting for teacher to set objective..."}</h2>
            </div>
            
          </div>

          {/* Student's Subtitle Area */}
          <div className="countdown-container">
            <TimerClock timeLeft={timeLeft} isRunning={isRunning} />
            <select value={studentLanguage} onChange={(e) => setStudentLanguage(e.target.value)}>
              {studentLanguageOptions.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
            <button onClick={() => setShowPopoutSubtitles(!showPopoutSubtitles)}>
                {showPopoutSubtitles ? 'Hide Pop-out Subtitles' : 'Show Pop-out Subtitles'}
            </button>
            <div className="student-subtitle-inline-display">
                <p>Subtitles: {translatedSubtitle || "Waiting for teacher to speak..."}</p>
            </div>
          </div>

          {/* Pop-out Subtitle Display */}
          {showPopoutSubtitles && (
              <div className="popout-subtitle-container">
                  <p>{translatedSubtitle || "Waiting for teacher to speak..."}</p>
              </div>
          )}

          
          <Footer />
        </div>
      )}
    </div>
  );
};