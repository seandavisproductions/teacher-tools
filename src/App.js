import React, { useState, useEffect, useContext } from 'react'; // <--- IMPORTANT: Add useContext
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TeacherView } from './TeacherView';
import { StudentView } from './StudentView';
import { Auth } from './Auth';
// Import the full SocketContext, not just useSocket, to access updateSessionCodeForSocket directly
import { SocketProvider, SocketContext as GlobalSocketContext } from './context/SocketContext'; // <--- IMPORTANT: Use a different name for SocketContext import

function App() {
  const [sessionCode, setSessionCode] = useState(null);
  // Get the entire context value, which includes 'socket' and 'updateSessionCodeForSocket'
  // using useContext from the directly imported SocketContext.
  const { socket, updateSessionCodeForSocket } = useContext(GlobalSocketContext);

  // This function will be passed to Auth component to set the session code after successful auth
  const handleAuthSuccess = (code) => {
    setSessionCode(code);
    // When sessionCode is set, update the SocketContext so it can emit joinSession
    if (updateSessionCodeForSocket) { // Defensive check
      updateSessionCodeForSocket(code);
    } else {
      console.error("App.js: updateSessionCodeForSocket is not available in SocketContext.");
    }
  };

  // Optional: Listen for socket connection status in App.js for debugging
  useEffect(() => {
    if (socket) {
      console.log('App.js: Socket instance available:', socket);
      console.log('App.js: Socket connected status:', socket.connected);
      socket.on('connect', () => console.log('App.js: Socket is now connected!'));
      socket.on('disconnect', () => console.log('App.js: Socket disconnected!'));
      socket.on('connect_error', (err) => console.error('App.js: Socket connection error in App:', err));
    }
    // Cleanup listeners when socket changes or App unmounts
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
      }
    };
  }, [socket]); // Dependency array: re-run if 'socket' instance changes

  return (
    // SocketProvider must wrap everything that needs its context
    // This is the correct placement to prevent remounting on route changes.
    // If it's outside this, then your application structure is somehow remounting App.js.
    <GlobalSocketContext.Provider value={{ socket, updateSessionCodeForSocket }}> {/* Provide the context value */}
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Auth onAuthSuccess={handleAuthSuccess} />} />

            {/* Teacher View Route:
                - If there's a sessionCode, render TeacherView with it.
                - Otherwise, redirect to the authentication page.
            */}
            <Route
              path="/teacher"
              element={sessionCode ? <TeacherView sessionCode={sessionCode} /> : <Navigate to="/" />}
            />

            {/* Student View Route:
                - This route expects a sessionCode in the URL (e.g., /student/ABC12345)
            */}
            <Route
              path="/student/:sessionCodeFromUrl?" // Optional URL parameter for sessionCode
              element={<StudentView />}
            />

            {/* Add more routes as needed */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </GlobalSocketContext.Provider>
  );
}

export default App;