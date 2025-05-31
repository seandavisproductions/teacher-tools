// src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);
const SOCKET_SERVER_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [sessionCode, setSessionCode] = useState(null); // State for sessionCode
  const [timerState, setTimerState] = useState({ timeLeft: 0, isRunning: false }); // Add timer state

  const latestSessionCodeRef = useRef(sessionCode);
  const joinedSessionsRef = useRef({});

  useEffect(() => {
    latestSessionCodeRef.current = sessionCode;
    // Reset joined sessions when socket disconnects
    socket?.on('disconnect', () => {
      joinedSessionsRef.current = {};
    });
  }, [sessionCode, socket]);

  useEffect(() => {
    console.log("SocketContext: Initializing Socket.IO connection to", SOCKET_SERVER_URL);
    const socketInstance = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('SocketContext: Socket connected successfully! ID:', socketInstance.id);
      if (latestSessionCodeRef.current) {
        console.log(`DEBUG: Emitting joinSession from on('connect'). Code: ${latestSessionCodeRef.current}`);
        // Get the token from localStorage
        const token = localStorage.getItem('token') || 'missing';
        // Send both the session code and token
        socketInstance.emit('joinSession', { sessionCode: latestSessionCodeRef.current, token });
        // Mark this session as joined
        joinedSessionsRef.current[latestSessionCodeRef.current] = true;
      } else {
        console.log('SocketContext: Socket connected, but no sessionCode to join yet (from on("connect")).');        
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
    if (socket && socket.connected && sessionCode) {
      // Only join if we haven't joined this session before
      if (!joinedSessionsRef.current[sessionCode]) {
        console.log(`DEBUG: Emitting joinSession from sessionCode useEffect. Code: ${sessionCode}`);
        const token = localStorage.getItem('token') || 'missing';
        socket.emit('joinSession', { sessionCode, token });
        joinedSessionsRef.current[sessionCode] = true;
      } else {
        console.log(`DEBUG: Already joined session ${sessionCode}, not re-joining`);
      }
      
      // Set up listeners for timer events
      socket.on('timerState', (data) => {
        console.log('SocketContext: Received timerState from server:', data);
        // Convert milliseconds to seconds if needed
        const timeLeft = data.remainingTime ? Math.floor(data.remainingTime / 1000) : data.timeLeft;
        setTimerState({ 
          isRunning: data.isRunning, 
          timeLeft: timeLeft
        });
      });
      
      socket.on('timerUpdate', (data) => {
        console.log('SocketContext: Received timerUpdate from server:', data);
        // Convert milliseconds to seconds if needed
        const timeLeft = data.remainingTime ? Math.floor(data.remainingTime / 1000) : data.timeLeft;
        setTimerState({ 
          isRunning: data.isRunning, 
          timeLeft: timeLeft
        });
      });
      
      socket.on('timerReset', () => {
        console.log('SocketContext: Received timerReset from server');
        setTimerState({ timeLeft: 0, isRunning: false });
      });
      
      // Request current timer state
      socket.emit('requestTimerState', { sessionCode });
      
      return () => {
        socket.off('timerState');
        socket.off('timerUpdate');
        socket.off('timerReset');
      };
    }
  }, [socket, sessionCode]);

  const updateSessionCodeForSocket = (code) => {
    if (typeof code === 'string' && code.length > 0) {
      setSessionCode(code);
      if (socket && socket.connected) {
        // Only join if we haven't joined this session before
        if (!joinedSessionsRef.current[code]) {
          console.log(`DEBUG: Emitting joinSession from updateSessionCodeForSocket. Code: ${code}`);
          const token = localStorage.getItem('token') || 'missing';
          socket.emit('joinSession', { sessionCode: code, token });
          joinedSessionsRef.current[code] = true;
        } else {
          console.log(`DEBUG: Already joined session ${code}, not re-joining`);
        }
      }
    } else {
      console.warn("SocketContext: Attempted to set/update sessionCode with an invalid value:", code);
      setSessionCode(null);
    }
  };

  return (
    <SocketContext.Provider
      value={{ 
        socket, 
        sessionCode, 
        updateSessionCodeForSocket,
        timerState,
        isTimerRunning: timerState.isRunning,
        timeLeft: timerState.timeLeft
      }}
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