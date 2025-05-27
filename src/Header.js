import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { GenerateStudentCode } from "./GenerateStudentCode";
import { Subtitles } from "./subtitles"; // NEW: Import the Subtitles component

// Define the Socket.IO server URL outside the component
const SOCKET_SERVER_URL = 'https://teacher-toolkit-back-end.onrender.com';

export function Header({ teacherId, setteacherId, sessionCode, setSessionCode, isAuthenticated, setIsAuthenticated}) {
  const [objective, setObjective] = useState("");
  const socketRef = useRef(null); // Ref to hold socket instance

  // --- Socket.IO connection and objective emission ---
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_SERVER_URL, {
        withCredentials: true,
      });

      socketRef.current.on('connect', () => {
        console.log('Teacher Header connected to socket');
        if (sessionCode) {
          socketRef.current.emit('joinSession', sessionCode);
        }
      });

      socketRef.current.on('objectiveUpdate', (receivedObjective) => {
          console.log('Teacher Header received objectiveUpdate confirmation:', receivedObjective);
      });

      // No longer need subtitle specific listeners here as Subtitles.js handles them
      // socketRef.current.on('subtitleUpdate', (data) => { /* ... */ });
      // socketRef.current.on('subtitleError', (message) => { /* ... */ });

      socketRef.current.on('disconnect', () => console.log('Teacher Header disconnected'));
      socketRef.current.on('connect_error', (err) => console.error('Teacher Header socket error:', err));
    }

    if (sessionCode && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('joinSession', sessionCode);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      // No need to stop media recorder here, Subtitles component will handle its cleanup
    };
  }, [sessionCode]);

  useEffect(() => {
    if (socketRef.current && sessionCode) {
      const handler = setTimeout(() => {
        socketRef.current.emit('setObjective', { sessionCode, objectiveText: objective });
      }, 500);
      return () => {
        clearTimeout(handler);
      };
    }
  }, [objective, sessionCode]);

  // --- Fullscreen Toggle ---
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  // --- JSX for Header ---
  return (
    <div>
      <div className="header">
        <button onClick={toggleFullscreen} className="button-fullscreen">
          <img className="styled-image fullscreen" src={`${process.env.PUBLIC_URL}/FullScreen Logo.png`} alt="Fullscreen" />
        </button>
        <img className="styled-image logo" src={`${process.env.PUBLIC_URL}/logo teacher toolkit.png`} alt="Teacher Toolkit"/>
        <input
          className="input-text"
          type="text"
          placeholder="Objective: To understand how to use Teacher Toolkit"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
        ></input>
        <GenerateStudentCode
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          teacherId={teacherId}
          setteacherId={setteacherId}
          sessionCode={sessionCode}
          setSessionCode={setSessionCode}
        />

        {/* NEW: Integrate the Subtitles Component for Teacher */}
        {/* Pass the socket instance, sessionCode, and specify it's the teacher view */}
        {socketRef.current && sessionCode && (
            <Subtitles
                socket={socketRef.current}
                sessionCode={sessionCode}
                isTeacherView={true}
            />
        )}
      </div>
    </div>
  );
}