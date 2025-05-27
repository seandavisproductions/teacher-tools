// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TeacherView } from './TeacherView';
import { StudentView } from './StudentView';
import { SocketProvider } from './context/SocketContext'; // Essential for stable socket

function App() {
  return (
    <SocketProvider> {/* This wraps the entire app to keep the socket stable */}
      <Router>
        <div className="App">
          <Routes>
            {/* Anyone can access TeacherView directly via / or /teacher */}
            <Route path="/" element={<TeacherView />} />
            <Route path="/teacher" element={<TeacherView />} />

            {/* Student View (requires a sessionCode in the URL) */}
            <Route path="/student/:sessionCodeFromUrl?" element={<StudentView />} />

            {/* Fallback for any unknown paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;