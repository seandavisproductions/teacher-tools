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


const tools = [
  { title: "Exercise Instructions", id: 1 },
  { title: "Presentation", id: 2 },
  { title: "Exit Ticket", id: 3 },
  { title: "Sound Board", id: 4 }
];


export const TeacherView = ({generateCode, sessionCode}) => {
  const [curOpen, setCurOpen] = useState("")
  const [isOpen, setIsOpen] = useState("false")
  
  return (
    <div>
      <button onClick={generateCode}>Generate Student Code</button>
      {sessionCode && <p>Student Code: <strong>{sessionCode}</strong></p>}
  <div className="main-content">
      <Header tools={tools} />
      
      <CountdownTimer/>
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
      
    </div>
  );
};
