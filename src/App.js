// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { TeacherView } from './TeacherView';
import { StudentView } from './StudentView'; // Assuming StudentView exists
import { RoleSelection } from './RoleSelection';

function App() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  const handleRoleSelect = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  // NEW FUNCTION: Handles resetting the user's role
  const handleResetRole = () => {
    setUserRole(null); // Set role to null to show RoleSelection
    localStorage.removeItem('userRole'); // Clear from local storage
    // Optionally, you might want to clear other session data if switching roles implies a full logout.
    // E.g., localStorage.removeItem('token'); localStorage.removeItem('sessionCode');
  };

  let content;
  if (userRole === null) {
    content = <RoleSelection onSelectRole={handleRoleSelect} />;
  } else if (userRole === 'teacher') {
    content = (
      <SocketProvider>
        {/* Pass the new handleResetRole function to TeacherView */}
        <TeacherView onResetRole={handleResetRole} />
      </SocketProvider>
    );
  } else if (userRole === 'student') {
    content = (
      <SocketProvider>
        {/* Pass the new handleResetRole function to StudentView */}
        <StudentView onResetRole={handleResetRole} />
      </SocketProvider>
    );
  } else {
    content = <p>Error: Invalid role selected.</p>;
  }

  return (
    <Router>
      {content}
    </Router>
  );
}

export default App;