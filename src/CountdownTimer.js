import { useEffect, useRef } from "react";


export function CountdownTimer({ timeLeft, setTimeLeft, isRunning, setIsRunning }) {
  
  const audioRef = useRef(
    new Audio(process.env.PUBLIC_URL + '/696048__musik-fan__up-to-the-top-of-the-hour-beep.wav')
  );

  function startTimer(seconds) {
    setTimeLeft(seconds);
    setIsRunning(true);
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
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setIsRunning(false);
    }
  }, [timeLeft, isRunning]);



  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div className="countdown-container">
      <h3>Countdown Timer</h3>
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
          onChange={handleCustomTime} />
      </div>
    </div>
  );
}
