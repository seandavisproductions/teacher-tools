import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// Replace with your backend URL
const SOCKET_SERVER_URL = 'https://teacher-toolkit-back-end.onrender.com'; // Or your Render backend URL

// Rename the component to CountdownTimerBoard
const CountdownTimerBoard = ({ isAuthenticated, sessionCode }) => { // Prop renamed to isAuthenticated
    const [timeLeft, setTimeLeft] = useState(0); // Current time left
    const [isRunning, setIsRunning] = useState(false);
    const [inputMinutes, setInputMinutes] = useState('');
    const [inputSeconds, setInputSeconds] = useState('');

    const timerIntervalRef = useRef(null); // Ref to hold the interval ID
    const socketRef = useRef(null); // Ref to hold the Socket.IO client instance
    const lastServerSyncTimeRef = useRef(Date.now()); // To track when the timer was last synced from the server

    useEffect(() => {
        // Initialize Socket.IO connection
        socketRef.current = io('https://teacher-toolkit-back-end.onrender.com');

        socketRef.current.on('connect', () => {
            console.log('Connected to Socket.IO server!');
            // Join the session room as soon as connected
            if (sessionCode) {
                socketRef.current.emit('joinSession', sessionCode);
            }
        });

        // Listen for timer updates from the server
        socketRef.current.on('timerUpdate', (data) => {
            console.log('Received timerUpdate:', data);
            const { isRunning: serverIsRunning, timeLeft: serverTimeLeft } = data;

            // Update state based on server's most recent known timer state
            setIsRunning(serverIsRunning);
            setTimeLeft(serverTimeLeft);
            lastServerSyncTimeRef.current = Date.now(); // Mark when we last received an update

            // If the server says it's running, ensure our local interval is active
            if (serverIsRunning) {
                // Clear any existing interval to prevent duplicates or stale timers
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                }
                // Start a new interval to count down locally
                timerIntervalRef.current = setInterval(() => {
                    const elapsedTimeSinceLastSync = Date.now() - lastServerSyncTimeRef.current;
                    const newTimeLeft = serverTimeLeft - Math.floor(elapsedTimeSinceLastSync / 1000);

                    if (newTimeLeft <= 0) {
                        setTimeLeft(0);
                        setIsRunning(false); // Timer has finished
                        clearInterval(timerIntervalRef.current);
                        timerIntervalRef.current = null;
                    } else {
                        setTimeLeft(newTimeLeft);
                    }
                }, 1000); // Update every second
            } else {
                // If server says it's paused or stopped, ensure our local timer also stops
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = null;
                }
            }
        });

        // Listen for timer reset from the server
        socketRef.current.on('timerReset', (data) => {
            console.log('Received timerReset:', data);
            setTimeLeft(0);
            setIsRunning(false);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        });

        // Cleanup on component unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [sessionCode]); // Dependency array: Re-run effect if sessionCode changes

    // This effect handles the local countdown *after* the state (timeLeft, isRunning) has been set
    // by either the teacher's input or a server update.
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            // No need to set interval here, it's already set in the socket.on('timerUpdate') listener
            // when the server indicates the timer is running. This prevents duplicate intervals
            // if local changes were also triggering an interval.
        } else if ((!isRunning && timerIntervalRef.current) || (timeLeft <= 0 && timerIntervalRef.current)) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
            if (timeLeft <= 0) {
                setIsRunning(false); // Ensure isRunning is false when time runs out
            }
        }
        // This effect mainly ensures intervals are cleared when timer stops or runs out.
    }, [isRunning, timeLeft]);


    const handleSetTimer = () => {
        const minutes = parseInt(inputMinutes) || 0;
        const seconds = parseInt(inputSeconds) || 0;
        const initialTime = (minutes * 60) + seconds;

        if (initialTime > 0) {
            setTimeLeft(initialTime);
            setIsRunning(false); // Teacher sets it, but doesn't start until they click 'Start'
            if (isAuthenticated && socketRef.current) { // Check isAuthenticated here
                socketRef.current.emit('startTimer', {
                    sessionCode,
                    isRunning: false, // Teacher sets, not auto-starts
                    timeLeft: initialTime
                });
            }
        }
    };

    const handleStartPause = () => {
        if (!isAuthenticated) return; // Only authenticated user can start/pause

        if (isRunning) {
            // Pausing
            setIsRunning(false);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            if (socketRef.current) {
                socketRef.current.emit('pauseTimer', { sessionCode, timeLeft });
            }
        } else {
            // Starting
            if (timeLeft > 0) {
                setIsRunning(true);
                lastServerSyncTimeRef.current = Date.now(); // Sync point for local countdown
                if (socketRef.current) {
                    socket.current.emit('startTimer', {
                        sessionCode,
                        isRunning: true,
                        timeLeft: timeLeft
                    });
                }
            } else {
                // If timeLeft is 0 (e.g., after reset), use initial input values
                const minutes = parseInt(inputMinutes) || 0;
                const seconds = parseInt(inputSeconds) || 0;
                const initialTimeFromInput = (minutes * 60) + seconds;
                if (initialTimeFromInput > 0) {
                    setTimeLeft(initialTimeFromInput);
                    setIsRunning(true);
                    lastServerSyncTimeRef.current = Date.now();
                    if (socketRef.current) {
                        socketRef.current.emit('startTimer', {
                            sessionCode,
                            isRunning: true,
                            timeLeft: initialTimeFromInput
                        });
                    }
                }
            }
        }
    };

    const handleReset = () => {
        if (!isAuthenticated) return; // Only authenticated user can reset
        setTimeLeft(0);
        setIsRunning(false);
        setInputMinutes('');
        setInputSeconds('');
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        if (socketRef.current) {
            socketRef.current.emit('resetTimer', sessionCode);
        }
    };

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div>
            <h2>Timer: {formatTime(timeLeft)}</h2>

            {isAuthenticated && ( // Conditional rendering based on isAuthenticated
                <div>
                    <input
                        type="number"
                        placeholder="Minutes"
                        value={inputMinutes}
                        onChange={(e) => setInputMinutes(e.target.value)}
                        min="0"
                    />
                    <input
                        type="number"
                        placeholder="Seconds"
                        value={inputSeconds}
                        onChange={(e) => setInputSeconds(e.target.value)}
                        min="0"
                    />
                    <button onClick={handleSetTimer}>Set Timer</button>
                    <button onClick={handleStartPause}>
                        {isRunning ? 'Pause' : 'Start'}
                    </button>
                    <button onClick={handleReset}>Reset</button>
                </div>
            )}

            {!isAuthenticated && ( // Message for non-authenticated users
                <p>Waiting for the timer to be set and started by an authenticated user...</p>
            )}
        </div>
    );
};

export default CountdownTimerBoard; // Export with the new name

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
