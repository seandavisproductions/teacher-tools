import { useState } from 'react';
import "./index.css";
import { Header } from "./Header";
import { CountdownTimer } from "./CountdownTimer";
import { Buttons } from "./Buttons";
import { ExerciseInstructions } from "./ExerciseInstructions";
import { Presentation } from "./Presentation";
import { SoundBoard } from "./SoundBoard";
import { ExitTicket } from "./ExitTicket";
import { Footer } from "./Footer";
import { Welcome } from "./Welcome";
import { io } from "socket.io-client";
const socket = io("https://teacher-toolkit-back-end.onrender.com");



const tools = [
  { title: "Exercise Instructions", id: 1 },
  { title: "Presentation", id: 2 },
  { title: "Exit Ticket", id: 3 },
  { title: "Sound Board", id: 4 }
];


export const TeacherView = ({generateCode, sessionCode, setSessionCode, timeLeft, setTimeLeft}) => {
const sendUpdate = (sessionCode, newData) => {
  socket.emit("updateSession", { sessionCode, newData });
};

const startTimer = (seconds) => {
  socket.emit("startCountdown", { sessionCode, duration: seconds });
};


const handleSessionUpdate = (newData) => {
  sendUpdate(sessionCode, newData);  // Now updates are sent!
};

const handleGenerateCode = () => {
  const newCode = Math.random().toString(36).substr(2, 6).toUpperCase();
  setSessionCode(newCode);
  sendUpdate(newCode, { message: "New session code created!" }); 
};


  const [curOpen, setCurOpen] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  
  return (
  
  <div className="main-content">
      <Header tools={tools} />
        <button onClick={handleGenerateCode}>Generate Student Code</button>
      {sessionCode && <p>Student Code: <strong>{sessionCode}</strong></p>}
      <CountdownTimer setTimeLeft={setTimeLeft} timeLeft={timeLeft}/>
      <Buttons tools={tools} curOpen={curOpen} setIsOpen={setIsOpen} />
      
  
  {curOpen > 0 ? (
    <>
      {curOpen === 1 && (
        <ExerciseInstructions/>
      )}
      {curOpen === 2 && (
        <Presentation/>
      )}
      {curOpen === 3 && (
        <ExitTicket />
      )}
      {curOpen === 4 && <SoundBoard />}
    </>
  ) : (
    <Welcome />
  )}
      <Footer />
    </div>
      
  );
};
