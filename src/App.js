// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// CORRECTED IMPORT: Use the correct path and exported component name 'SocketProvider'
import { SocketProvider } from './context/SocketContext';
import { TeacherView } from './TeacherView';
import { StudentView } from './StudentView';
import { RoleSelection } from './RoleSelection';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ResetPassword } from './ResetPassword';

function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setUserRole(storedRole);
    }

    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleRoleSelect = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const handleResetRole = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    localStorage.removeItem('sessionCode');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
  };

  const handleGlobalAuthSuccess = (sessionCode, userId) => {
    setIsAuthenticated(true);
  };

  // CORRECTED: Use an environment variable for Google Client ID
  // Make sure REACT_APP_GOOGLE_CLIENT_ID is set in your .env file
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* ADD THE 'basename' PROP HERE */}
      {/* This tells React Router that your app is hosted under the /teacher-tools/ subdirectory */}
      <Router basename="/teacher-tools">
        <Routes>
          <Route
            path="/reset-password"
            element={
              <ResetPassword
                closeModal={() => { /* Add navigation here if needed */ }}
                onAuthSuccess={handleGlobalAuthSuccess}
              />
            }
          />

          <Route
            path="/" // This path will now correctly map to /teacher-tools/
            element={
              userRole === null ? (
                <RoleSelection onSelectRole={handleRoleSelect} />
              ) : userRole === 'teacher' ? (
                <SocketProvider>
                  <TeacherView
                    onResetRole={handleResetRole}
                    onAuthAndSessionSuccess={handleGlobalAuthSuccess}
                  />
                </SocketProvider>
              ) : userRole === 'student' ? (
                <SocketProvider>
                  <StudentView
                    onResetRole={handleResetRole}
                    onAuthAndSessionSuccess={handleGlobalAuthSuccess}
                  />
                </SocketProvider>
              ) : (
                <p>Error: Invalid role selected.</p>
              )
            }
          />

          {/* This catch-all will now navigate to /teacher-tools/ if other paths don't match */}
          {/* It's still good practice to have this, but with basename, it should work correctly */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;