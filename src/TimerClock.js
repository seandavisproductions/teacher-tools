import { useState, useEffect, useRef } from "react";

export function TimerClock({timeLeft}) {
    const [curTheme, setCurTheme] = useState(0)
    
    const audioRef = useRef(
    new Audio(process.env.PUBLIC_URL + '/696048__musik-fan__up-to-the-top-of-the-hour-beep.wav')
  );

   useEffect(() => {
     if (timeLeft === 5) {
     audioRef.current.play();
     }
    }, [timeLeft]);


    const themes = [ 
  "digital-clock minimal-clock",
  "digital-clock dark-clock",
  "digital-clock sunset-clock",
  "digital-clock retro-clock",
  "digital-clock dark-clock"
];
  
    function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }
    
  function handleTheme() {
    setCurTheme(prev => (prev + 1) % themes.length);
  }
    return (
     <div>
      <button className={themes[curTheme]} onClick={handleTheme}>
        {formatTime(timeLeft)}
      </button>
    </div>
    )
}

