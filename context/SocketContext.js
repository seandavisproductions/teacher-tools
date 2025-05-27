import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';


// Define your backend URL once
const SOCKET_SERVER_URL = 'https://teacher-toolkit-back-end.onrender.com';

// Create the Socket Context
const SocketContext = createContext(null);

// Create the Socket Provider component
export const SocketProvider = ({ children, sessionCode }) => {
  const [socket, setSocket] = useState(null);
  const isConnectingRef = useRef(false); // To prevent multiple socket initializations

  useEffect(() => {
    // Only initialize socket if it hasn't been initialized yet and not currently connecting
    if (!socket && !isConnectingRef.current) {
      isConnectingRef.current = true;
      console.log('SocketContext: Initializing Socket.IO connection...');

      const newSocket = io(SOCKET_SERVER_URL, {
        withCredentials: true,
        // Add any other global Socket.IO options here if needed
      });

      newSocket.on('connect', () => {
        console.log('SocketContext: Main Socket connected:', newSocket.id);
        // Automatically join the session once connected, if sessionCode is available
        if (sessionCode) {
          console.log(`SocketContext: Emitting joinSession for ${sessionCode} on connect.`);
          newSocket.emit('joinSession', sessionCode);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('SocketContext: Main Socket disconnected.');
      });

      newSocket.on('connect_error', (err) => {
        console.error('SocketContext: Socket connection error:', err.message);
      });

      setSocket(newSocket); // Set the socket into state

      // Cleanup function: Disconnect the socket when the provider unmounts
      return () => {
        console.log('SocketContext: Cleaning up socket connection...');
        newSocket.disconnect();
        isConnectingRef.current = false; // Reset ref on cleanup
      };
    }
    // No dependency on `socket` to prevent re-initialization loops.
    // `isConnectingRef` handles single initialization.
  }, [sessionCode]); // Re-run effect if sessionCode changes (e.g., user joins a new session)

  // Emit joinSession whenever the socket instance is available and sessionCode changes
  useEffect(() => {
    if (socket && sessionCode) {
      console.log(`SocketContext: Emitting joinSession for ${sessionCode} from sessionCode effect.`);
      socket.emit('joinSession', sessionCode);
    }
  }, [socket, sessionCode]);


  return (
    // Provide the socket instance to all children wrapped by this provider
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to easily consume the socket in any functional component
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    // This error helps catch cases where useSocket is used outside SocketProvider
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};