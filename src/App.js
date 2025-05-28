// src/App.js
import React, { useState, useEffect } from 'react';
// NEW IMPORTS for routing: Routes, Route, Navigate
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { TeacherView } from './TeacherView';
import { StudentView } from './StudentView';
import { RoleSelection } from './RoleSelection';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ResetPassword } from './ResetPassword'; // <-- NEW IMPORT for ResetPassword

function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  // NEW STATE: To track if any user is authenticated globally (based on token)
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setUserRole(storedRole);
    }

    // NEW: Check token on app load to set global authentication status
    const token = localStorage.getItem('token');
    if (token) {
      // In a real application, you might send this token to your backend
      // for validation to ensure it's still active and not expired.
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []); // Empty dependency array means this runs once on mount

  const handleRoleSelect = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const handleResetRole = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
    // Clear authentication-related data and global auth state on role reset/logout
    localStorage.removeItem('token');
    localStorage.removeItem('sessionCode'); // Assuming you store this
    localStorage.removeItem('userId');       // Assuming you store this
    setIsAuthenticated(false);
  };

  // NEW FUNCTION: This handler is called by Header (via Login/Register) on successful authentication.
  // It updates the global isAuthenticated state in App.js.
  const handleGlobalAuthSuccess = (sessionCode, userId) => {
    setIsAuthenticated(true);
    // You can add more global state updates or redirection logic here if needed after auth
  };

  const GOOGLE_CLIENT_ID = '322138755912-ieuh7mhpspt2jbat447sdqnpf3b4k5tl.apps.googleusercontent.com';
  // IMPORTANT: For production, use an environment variable: process.env.REACT_APP_GOOGLE_CLIENT_ID

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        {/*
          The <Routes> component allows you to define multiple <Route>s.
          It will render the first <Route> that matches the current URL.
        */}
        <Routes>
          {/* NEW ROUTE: For password reset from email link */}
          <Route
            path="/reset-password"
            element={
              <ResetPassword
                // For a full page component like ResetPassword, closeModal might trigger a navigate
                closeModal={() => { /* You can add navigation here if needed, e.g., navigate('/login'); */ }}
                onAuthSuccess={handleGlobalAuthSuccess} // If reset auto-logs in
              />
            }
          />

          {/* Default Route for your main application flow */}
          <Route
            path="/"
            element={
              userRole === null ? (
                // If no role selected, show role selection
                <RoleSelection onSelectRole={handleRoleSelect} />
              ) : userRole === 'teacher' ? (
                // If teacher role, render TeacherView.
                // Pass handleGlobalAuthSuccess down so TeacherView can pass it to Header, then Login/Register.
                <SocketProvider>
                  <TeacherView
                    onResetRole={handleResetRole}
                    onAuthAndSessionSuccess={handleGlobalAuthSuccess} // Pass this down
                  />
                </SocketProvider>
              ) : userRole === 'student' ? (
                // If student role, render StudentView.
                // Pass handleGlobalAuthSuccess down similarly.
                <SocketProvider>
                  <StudentView
                    onResetRole={handleResetRole}
                    onAuthAndSessionSuccess={handleGlobalAuthSuccess} // Pass this down
                  />
                </SocketProvider>
              ) : (
                // Fallback for invalid role
                <p>Error: Invalid role selected.</p>
              )
            }
          />

          {/* Optional: A catch-all route for unmatched paths (e.g., 404 or redirect to home) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;