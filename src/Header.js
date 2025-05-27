import React, { useState, useEffect, useRef } from "react";
import { GenerateStudentCode } from "./GenerateStudentCode";
import { Subtitles } from "./subtitles"; // Import the Subtitles component
import { useSocket } from './context/SocketContext'; // Import the useSocket hook

// REMOVE: No longer needed here as socket comes from context
// const SOCKET_SERVER_URL = 'https://teacher-toolkit-back-end.onrender.com';

export function Header({ teacherId, setteacherId, sessionCode, setSessionCode, isAuthenticated, setIsAuthenticated }) {
  const [objective, setObjective] = useState("");
  // REMOVE: No longer need socketRef as useSocket will provide the instance
  // const socketRef = useRef(null);

  // Get the socket instance from context
  const socket = useSocket(); // <-- Get the socket instance here!

  // --- Socket.IO listeners and joinSession logic ---
  useEffect(() => {
    // IMPORTANT: Ensure socket is available before setting up listeners
    if (!socket || !sessionCode) {
      console.warn("Header: Socket or sessionCode not available (yet).");
      return;
    }

    console.log('Header: Setting up Socket.IO listeners for session:', sessionCode);

    // No need for 'connect' listener here, as SocketProvider handles global connection
    // and joinSession.

    socket.on('objectiveUpdate', (receivedObjective) => {
        console.log('Teacher Header received objectiveUpdate confirmation:', receivedObjective);
        // You might want to update the local objective state here if the server confirms it,
        // or if another teacher modifies it.
        // setObjective(receivedObjective); // Uncomment if you want to sync objective from server
    });

    // Cleanup: Remove listeners when component unmounts or socket/sessionCode changes
    return () => {
      console.log('Header: Cleaning up Socket.IO listeners.');
      if (socket) { // Ensure socket exists before removing listeners
        socket.off('objectiveUpdate');
      }
      // NO LONGER call socket.disconnect() here, as SocketProvider manages the global connection.
      // The socket itself is stable across component mounts/unmounts.
    };
  }, [socket, sessionCode]); // Dependencies now include `socket`

  // --- Objective emission (with debounce) ---
  useEffect(() => {
    // IMPORTANT: Ensure socket is available and connected before emitting
    if (!socket || !socket.connected || !sessionCode) {
      console.warn("Header: Socket not connected or sessionCode missing, cannot emit objective.");
      return;
    }

    const handler = setTimeout(() => {
      console.log(`Header: Emitting setObjective for session ${sessionCode} with objective: ${objective}`);
      socket.emit('setObjective', { sessionCode, objectiveText: objective });
    }, 500); // Debounce for 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [objective, sessionCode, socket]); // Dependencies now include `socket`

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
          // NO LONGER PASSING `socket` PROP HERE! GenerateStudentCode will use useSocket()
        />

        {/* Integrate the Subtitles Component for Teacher */}
        {/* NO LONGER PASSING `socket` PROP HERE! Subtitles will use useSocket() */}
        {sessionCode && ( // Only render subtitles if sessionCode is present
            <Subtitles
                sessionCode={sessionCode}
                isTeacherView={true}
            />
        )}
      </div>
    </div>
  );
}