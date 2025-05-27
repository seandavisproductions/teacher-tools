// src/TeacherView.js
import React, { useState, useEffect, useContext } from 'react';
import { Header } from './Header';
import { CountdownTimerBoard } from './CountdownTimerBoard';
import { ExerciseInstruction } from './ExerciseInstruction';
import { Buttons } from './Buttons';
import { Footer } from './Footer';
import { SocketContext as GlobalSocketContext } from './context/SocketContext'; // To access the socket and its update function

export function TeacherView() {
  const [sessionCode, setSessionCode] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  // Get the socket instance and the function to update session code in the socket context
  const { socket, updateSessionCodeForSocket } = useContext(GlobalSocketContext);

  // This useEffect runs whenever sessionCode changes.
  // It tells the SocketContext to emit 'joinSession' with the new code.
  useEffect(() => {
    if (sessionCode && updateSessionCodeForSocket) {
      console.log('TeacherView: Notifying SocketContext with new sessionCode:', sessionCode);
      updateSessionCodeForSocket(sessionCode);
    }
  }, [sessionCode, updateSessionCodeForSocket]); // Re-run if sessionCode or the update function changes

  // This handler is passed down to the Login component (via Header).
  // It updates the TeacherView's state after a successful login/session generation.
  const handleAuthAndSessionSuccess = (code, id) => {
    console.log('TeacherView: Auth/Session success! Setting sessionCode:', code, 'teacherId:', id);
    setSessionCode(code);
    setTeacherId(id);
    // The useEffect above will handle calling updateSessionCodeForSocket
  };

  return (
    <div className="teacher-view-container">
      <Header
        sessionCode={sessionCode}
        setSessionCode={setSessionCode} // Pass this down so Login/Generate can update it
        teacherId={teacherId}
        setTeacherId={setTeacherId}   // Pass this down so Login/Generate can update it
        onAuthAndSessionSuccess={handleAuthAndSessionSuccess} // Pass the success handler to Header
      />
      {/* Pass sessionCode and teacherId down to other components that need them */}
      <CountdownTimerBoard sessionCode={sessionCode} teacherId={teacherId} />
      <Buttons sessionCode={sessionCode} teacherId={teacherId} />
      <ExerciseInstruction sessionCode={sessionCode} teacherId={teacherId} />
      <Footer sessionCode={sessionCode} teacherId={teacherId} />
    </div>
  );
}