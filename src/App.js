import { useState, useEffect } from "react";
import "./index.css";
import { Header } from "./Header";
import { CountdownTimer } from "./CountdownTimer";
import { Buttons } from "./Buttons";
import { ExerciseInstructions } from "./ExerciseInstructions";
import { Presentation } from "./Presentation";
import { SoundBoard } from "./SoundBoard";
import { ExitTicket } from "./ExitTicket";
import { Footer } from "./Footer";
import { FadeInComponent } from "./FadeInComponent";

const tools = [
  { title: "Exercise Instructions", id: 1 },
  { title: "Presentation", id: 2 },
  { title: "Exit Ticket", id: 3 },
  { title: "Sound Board", id: 4 }
];

export default function App() {
  const [curOpen, setIsOpen] = useState(null);
  const [qaList, setQaList] = useState([
    { question: "", answer: "" },
    { question: "", answer: "" },
    { question: "", answer: "" },
  ]);
  const [timeLeft, setTimeLeft] = useState(0); // Time in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [exercises, setExercises] = useState([{ exercise: "" }]);
  const [embedLink, setEmbedLink] = useState("");
  
  


  return (
    <div className="main-content">
      <Header tools={tools} />
      <CountdownTimer
        timeLeft={timeLeft}
        setTimeLeft={setTimeLeft}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
      />
      <Buttons tools={tools} curOpen={curOpen} setIsOpen={setIsOpen} />
      
  
  {curOpen > 0 ? (
    <>
      {curOpen === 1 && (
        <ExerciseInstructions
          exercises={exercises}
          setExercises={setExercises}
        />
      )}
      {curOpen === 2 && (
        <Presentation embedLink={embedLink} setEmbedLink={setEmbedLink}/>
      )}
      {curOpen === 3 && (
        <ExitTicket qaList={qaList} setQaList={setQaList} />
      )}
      {curOpen === 4 && <SoundBoard />}
    </>
  ) : (
    <FadeInComponent />
  )}
      <Footer />
    </div>
  );
}

