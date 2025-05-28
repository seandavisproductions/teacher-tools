// src/TeacherView.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Header } from './Header';
import { CountdownTimerBoard } from './CountdownTimerBoard';
import { ExerciseInstructions } from './ExerciseInstructions';
import { Tools as ToolButtons } from './Tools'; // <-- CHANGED: Import as Tools, then alias as ToolButtons
import { UnderDevelopment } from './UnderDevelopment';
import { Welcome } from './Welcome';

import { Footer } from './Footer';
import { SocketContext as GlobalSocketContext } from './context/SocketContext';


export function TeacherView({ onResetRole }) {
  const [sessionCode, setSessionCode] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  const { socket, updateSessionCodeForSocket } = useContext(GlobalSocketContext);
  const [activeToolId, setActiveToolId] = useState(null);
  const [curOpen, setCurOpen] = useState(null);
  const [isOpen, setIsOpen] = useState(false);


  const toolComponents = {
    'exercise-instructions': ExerciseInstructions,
  };

  useEffect(() => {
    if (sessionCode && updateSessionCodeForSocket) {
      console.log('TeacherView: Notifying SocketContext with new sessionCode:', sessionCode);
      updateSessionCodeForSocket(sessionCode);
    }
  }, [sessionCode, updateSessionCodeForSocket]);

  const handleAuthAndSessionSuccess = useCallback((code, id) => {
    console.log('TeacherView: Auth/Session success! Setting sessionCode:', code, 'teacherId:', id);
    setSessionCode(code);
    setTeacherId(id);
    if (socket && id && code) {
        socket.emit('joinSession', { sessionCode: code, userId: id, role: 'teacher' });
    }
  }, [socket]);


  return (
    <div className="teacher-view-container">
      <Header
        sessionCode={sessionCode}
        setSessionCode={setSessionCode}
        teacherId={teacherId}
        setTeacherId={setTeacherId}
        onAuthAndSessionSuccess={handleAuthAndSessionSuccess}
        onResetRole={onResetRole}
        
      />

      <CountdownTimerBoard sessionCode={sessionCode} teacherId={teacherId} />

      <ToolButtons // <-- Using the aliased name
        onToolSelect={setActiveToolId}
        curOpen={curOpen}
        setIsOpen={setIsOpen}
        setCurOpen={setCurOpen}
      />

      <div className="tool-display-area">
        {!activeToolId && (
          <Welcome />
        )}
        {activeToolId && (
          toolComponents[activeToolId] ? (
            React.createElement(toolComponents[activeToolId], { sessionCode, teacherId })
          ) : (
            <UnderDevelopment />
          )
        )}
      </div>

      <Footer sessionCode={sessionCode} teacherId={teacherId} />
    </div>
  );
}