// src/RoleSelection.js
import React from 'react';

export function RoleSelection({ onSelectRole }) {
  return (
    <div className="teacher-app" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh', // Take full viewport height
      textAlign: 'center',
      backgroundColor: '#f0f0f0', // Example background
      padding: '20px'
    }}>
      <img className="styled-image logo" src={`${process.env.PUBLIC_URL}/logo_teacher_toolkit.png`} alt="Teacher Toolkit"/>
      <h1>Welcome to the teacher toolkit!</h1>
      <h2>Are you a Teacher or a Student?</h2>
      <div style={{ marginTop: '30px' }}>
        <button
          onClick={() => onSelectRole('teacher')}
          className="button"
        >
          Teacher
        </button>
        <button
          onClick={() => onSelectRole('student')}
          className="button"
        >
          Student
        </button>
      </div>
    </div>
  );
}