import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
const socket = io("https://teacher-toolkit-back-end.onrender.com");

export function CountdownTimer({ timeLeft, setTimeLeft }) {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    socket.on("countdownUpdate", (data) => {
      setTimeLeft(data.timeLeft);
    });
    return () => socket.off("countdownUpdate");
  }, [setTimeLeft]);

  const audioRef = useRef(
    new Audio(process.env.PUBLIC_URL + '/696048__musik-fan__up-to-the-top-of-the-hour-beep.wav')
  );

  function startTimer(seconds) {
    setTimeLeft(seconds);
    setIsRunning(true);
    // Emit the timer start to all clients (teacher and students)
    socket.emit("countdownUpdate", { timeLeft: seconds });
  }

  function handleCustomTime(event) {
    const minutes = parseInt(event.target.value, 10);
    if (!isNaN(minutes) && minutes > 0) {
      startTimer(minutes * 60);
    }
  }

  useEffect(() => {
    if (timeLeft === 5) {
      audioRef.current.play();
    }
  }, [timeLeft]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          // Emit the updated time to all clients
          socket.emit("countdownUpdate", { timeLeft: newTime });
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setIsRunning(false);
    }
  }, [timeLeft, isRunning, setTimeLeft]);

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div className="countdown-container">
      <h3>Countdown Timer</h3>
      <button
        className={!isRunning ? "teacher-button-open" : "teacher-button-close"}
        onClick={() => setIsRunning(!isRunning)}
      >
        {!isRunning ? "Start" : "Stop"}
      </button>
      <p className="digital-clock">{formatTime(timeLeft)}</p>
      <div className="buttons">
        <button onClick={() => startTimer(5 * 60)}>5 Min</button>
        <button onClick={() => startTimer(10 * 60)}>10 Min</button>
        <button onClick={() => startTimer(15 * 60)}>15 Min</button>
        <button onClick={() => startTimer(20 * 60)}>20 Min</button>
        <input
          className="input-box-1"
          type="number"
          placeholder="Custom"
          onChange={handleCustomTime}
        />
      </div>
    </div>
  );
}
