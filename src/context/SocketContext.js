// src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

// 1. CREATE THE CONTEXT OBJECT
const SocketContext = createContext(null); // This is the object you're trying to import as GlobalSocketContext

const SOCKET_SERVER_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const sessionCodeRef = useRef(null);

  useEffect(() => {
    console.log("SocketContext: Initializing Socket.IO connection to", SOCKET_SERVER_URL);
    const socketInstance = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('SocketContext: Socket connected successfully! ID:', socketInstance.id);
      if (sessionCodeRef.current) {
        console.log(`SocketContext: Emitting joinSession for ${sessionCodeRef.current} after reconnect.`);
        socketInstance.emit('joinSession', sessionCodeRef.current);
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
  }, []);

  useEffect(() => {
    if (socket && socket.connected && sessionCodeRef.current) {
      console.log(`SocketContext: Emitting joinSession for ${sessionCodeRef.current} due to sessionCode update.`);
      socket.emit('joinSession', sessionCodeRef.current);
    }
  }, [socket, sessionCodeRef.current]);

  const updateSessionCodeForSocket = (code) => {
    sessionCodeRef.current = code;
    if (socket && socket.connected && code) {
      console.log(`SocketContext: Attempting to join session ${code} via updateSessionCodeForSocket.`);
      socket.emit('joinSession', code);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, updateSessionCodeForSocket }}>
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

// 2. EXPORT THE SocketContext OBJECT
export { SocketContext }; // <--- ADD THIS LINE IF IT'S MISSING!