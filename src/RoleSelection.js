// src/RoleSelection.js
import React from 'react';

export function RoleSelection({ onSelectRole }) {
  return (
    <div className="role-selection-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh', // Take full viewport height
      textAlign: 'center',
      backgroundColor: '#f0f0f0', // Example background
      padding: '20px'
    }}>
      <h2>Are you a Teacher or a Student?</h2>
      <div style={{ marginTop: '30px' }}>
        <button
          onClick={() => onSelectRole('teacher')}
          style={{
            margin: '10px',
            padding: '15px 30px',
            fontSize: '1.2em',
            cursor: 'pointer',
            backgroundColor: '#007bff', // Example button style
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          Teacher
        </button>
        <button
          onClick={() => onSelectRole('student')}
          style={{
            margin: '10px',
            padding: '15px 30px',
            fontSize: '1.2em',
            cursor: 'pointer',
            backgroundColor: '#28a745', // Example button style
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          Student
        </button>
      </div>
    </div>
  );
}