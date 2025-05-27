import { useEffect, useState } from "react";
import { TimerClock } from "./TimerClock";
import {socket} from "./Socket";


export function CountdownTimerBoard({sessionCode}) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [customTime, setCustomTime] = useState("");

  
   useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

 const startTimer = (seconds) => {
    setTimeLeft(seconds);
    setIsRunning(false);
  };


  // Whenever timeLeft changes and we have a valid sessionCode,
  // emit the countdown update to the backend, so students in that session receive it.
  useEffect(() => {
    if (sessionCode && isRunning) {
      socket.emit("countdownUpdate", { sessionCode, timeLeft });
    }
  }, [timeLeft, sessionCode, isRunning]);



// Toggle the timer. When starting, if no time is set yet and a custom time is provided, use it.
  const toggleStartStop = () => {
    if (!isRunning) {
      // On starting, if there's no preset time but a valid custom time is provided
      if (timeLeft === 0 && customTime.trim() !== "") {
        const customSeconds = parseInt(customTime, 10) * 60;
        if (!isNaN(customSeconds) && customSeconds > 0) {
          setTimeLeft(customSeconds);
        }
      }
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  // Update customTime and update timeLeft when the teacher types a number.
  // This updates immediately (if not running) so that the custom value is reflected.
  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomTime(val);
    // Calculate seconds from minutes
    const minutes = parseInt(val, 10);
    if (!isNaN(minutes) && minutes > 0) {
      setTimeLeft(minutes * 60);
    } else {
      setTimeLeft(0);
    }
  };

  return (
    <div className="countdown-container">
      <h3>Countdown Timer</h3>
      <button onClick={toggleStartStop} className={!isRunning ? "teacher-button-open" : "teacher-button-close"}>{!isRunning ? "Start" : "Stop"}</button>
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
          value={customTime}
          onChange={handleCustomChange} />
      </div>
    </div>
  );
}
