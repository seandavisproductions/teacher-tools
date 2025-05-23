import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { TimerClock } from "./TimerClock";
const socket = io("https://teacher-toolkit-back-end.onrender.com");



export function CountdownTimerBoard({timeLeft, setTimeLeft, teacherId, sessionCode}) {
  
  const [isRunning, setIsRunning] = useState(false);
  

// Function to start the timer from the teacher side
  function startTimer(seconds) {
    setTimeLeft(seconds);
    setIsRunning(true);
    // Emit a startCountdown event with teacherId and sessionCode so that the server can broadcast to the matching student view.
    if(teacherId && sessionCode) {
      socket.emit("startCountdown", { teacherId, sessionCode, timeLeft: seconds });
    }
  }

  function handleCustomTime(event) {
    const minutes = parseInt(event.target.value, 10);
    if (!isNaN(minutes) && minutes > 0) {
      startTimer(minutes * 60);
    }
  }

  return (
    <div className="countdown-container">
      <h3>Countdown Timer</h3>
      <button className={!isRunning ? "teacher-button-open" : "teacher-button-close"}onClick={() => {
          if (isRunning) {
            socket.emit("stopCountdown", { teacherId, sessionCode });
            setIsRunning(false);
          } else {
            // Optionally, allow manual start when not running
            setIsRunning(true);
          }
      }}>{!isRunning ? "Start" : "Stop"}</button>
      <TimerClock isRunning={isRunning} timeLeft={timeLeft}/>
      <div className="buttons">
        <button onClick={() => startTimer(5 * 60)}>5 Min</button>
        <button onClick={() => startTimer(10 * 60)}>10 Min</button>
        <button onClick={() => startTimer(15 * 60)}>15 Min</button>
        <button onClick={() => startTimer(20 * 60)}>20 Min</button>
        <input
          className="input-box-1"
          type="number"
          placeholder="Custom"
          onChange={handleCustomTime} />
      </div>
    </div>
  );
}
