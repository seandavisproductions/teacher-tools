import { GenerateStudentCode } from "./GenerateStudentCode";
import { useState, useEffect, useRef } from "react"; // <-- Import useEffect, useRef
import { io } from "socket.io-client"; // <-- Import io

// Define the Socket.IO server URL outside the component
const SOCKET_SERVER_URL = 'https://teacher-toolkit-back-end.onrender.com'; // Adjust as needed

export function Header({ teacherId, setteacherId, sessionCode, setSessionCode, isAuthenticated, setIsAuthenticated}) {
  const [objective, setObjective] = useState("");
  const socketRef = useRef(null); // <-- NEW: Ref to hold socket instance

  // Effect to manage Socket.IO connection and objective emission
  useEffect(() => {
    if (!socketRef.current) { // Initialize socket once
      socketRef.current = io(SOCKET_SERVER_URL, {
        withCredentials: true,
      });

      socketRef.current.on('connect', () => {
        console.log('Teacher Header connected to socket');
        if (sessionCode) {
          socketRef.current.emit('joinSession', sessionCode);
        }
      });
      // Optionally listen for objective updates from server to confirm
      socketRef.current.on('objectiveUpdate', (receivedObjective) => {
          console.log('Teacher Header received objectiveUpdate confirmation:', receivedObjective);
          // You might not need to update `objective` state here if teacher is the source of truth
      });
      socketRef.current.on('disconnect', () => console.log('Teacher Header disconnected'));
      socketRef.current.on('connect_error', (err) => console.error('Teacher Header socket error:', err));
    }

    // Join session if sessionCode becomes available or changes
    if (sessionCode && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('joinSession', sessionCode);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [sessionCode]); // Re-run if sessionCode changes

  // Effect to emit objective when it changes (debounced for performance)
  useEffect(() => {
    if (socketRef.current && sessionCode && objective.trim() !== '') {
      // Debounce: wait a bit after typing stops before sending
      const handler = setTimeout(() => {
        socketRef.current.emit('setObjective', { sessionCode, objectiveText: objective });
      }, 500); // Send after 500ms of no typing

      return () => {
        clearTimeout(handler);
      };
    }
    // Also emit if objective is cleared
    if (socketRef.current && sessionCode && objective.trim() === '') {
        socketRef.current.emit('setObjective', { sessionCode, objectiveText: '' });
    }
  }, [objective, sessionCode]); // Re-run if objective or sessionCode changes

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

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
          value={objective} // <-- Controlled input
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
      </div>
    </div>
  );
}