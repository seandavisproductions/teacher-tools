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
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
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
            path="/"
            element={
              userRole === null ? (
                <RoleSelection onSelectRole={handleRoleSelect} />
              ) : userRole === 'teacher' ? (
                // CORRECTED: Use the correct component name 'SocketProvider'
                <SocketProvider>
                  <TeacherView
                    onResetRole={handleResetRole}
                    onAuthAndSessionSuccess={handleGlobalAuthSuccess}
                  />
                </SocketProvider>
              ) : userRole === 'student' ? (
                // CORRECTED: Use the correct component name 'SocketProvider'
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;