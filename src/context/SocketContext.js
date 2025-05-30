// src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState, useRef } from 'react'; // Re-added useRef
import { io } from 'socket.io-client';

const SocketContext = createContext(null);
const SOCKET_SERVER_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [sessionCode, setSessionCode] = useState(null); // State for sessionCode

  // --- NEW: Ref to hold the latest sessionCode for callbacks ---
  const latestSessionCodeRef = useRef(sessionCode);

  // --- NEW: Effect to keep the ref updated with the latest sessionCode state ---
  useEffect(() => {
    latestSessionCodeRef.current = sessionCode;
  }, [sessionCode]); // This effect runs whenever sessionCode state changes

  // First useEffect: Initializes the socket connection (runs once on mount)
  useEffect(() => {
    console.log("SocketContext: Initializing Socket.IO connection to", SOCKET_SERVER_URL);
    const socketInstance = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('SocketContext: Socket connected successfully! ID:', socketInstance.id);
      // --- IMPORTANT: Use the ref here to get the latest sessionCode ---
      if (latestSessionCodeRef.current) {
        console.log(`SocketContext: Emitting joinSession for ${latestSessionCodeRef.current} after reconnect.`);
        socketInstance.emit('joinSession', latestSessionCodeRef.current);
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('SocketContext: Socket disconnected. Reason:', reason);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('SocketContext: Socket connection error:', err.message, err);
    });

    socketInstance.on('error', (err) => {
        console.error('SocketContext: General socket error:', err);
    });

    setSocket(socketInstance);

    return () => {
      console.log("SocketContext: Cleaning up socket instance.");
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('connect_error');
      socketInstance.off('error');
      socketInstance.disconnect();
    };
  }, []); // Empty dependency array: runs only once to set up the socket

  // Second useEffect: Emits joinSession when socket is ready AND sessionCode state changes
  useEffect(() => {
    if (socket && socket.connected && sessionCode) {
      console.log(`SocketContext: Emitting joinSession for ${sessionCode} due to sessionCode update.`);
      socket.emit('joinSession', sessionCode);
    }
  }, [socket, sessionCode]); // Dependency: socket and sessionCode state

  const updateSessionCodeForSocket = (code) => {
    setSessionCode(code); // This updates the state, which triggers the second useEffect
    // The direct emit here is useful for immediate feedback, though the useEffect also covers it
    if (socket && socket.connected && code) {
      console.log(`SocketContext: Attempting to join session ${code} via updateSessionCodeForSocket (direct emit).`);
      socket.emit('joinSession', code);
    }
  };

  return (
    <SocketContext.Provider
      value={{ socket, sessionCode, updateSessionCodeForSocket }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.socket;
};

export { SocketContext };