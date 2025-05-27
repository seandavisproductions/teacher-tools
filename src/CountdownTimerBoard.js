import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// Assume you have a TimerClock component. If not, you'll need to create a simple one
// or just integrate its logic directly into this component.
// For example:
const TimerClock = ({ isRunning, timeLeft }) => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return (
        <div style={{ fontSize: '3em', margin: '20px 0' }}>
            {formattedTime}
        </div>
    );
};


// Replace with your backend URL
const SOCKET_SERVER_URL = 'https://teacher-toolkit-back-end.onrender.com'; // Or your Render backend URL

const CountdownTimerBoard = ({ isAuthenticated, sessionCode }) => {
    const [timeLeft, setTimeLeft] = useState(0); // Current time left in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [customTime, setCustomTime] = useState(''); // Holds custom minutes input

    const timerIntervalRef = useRef(null); // Ref to hold the interval ID for local countdown
    const socketRef = useRef(null); // Ref to hold the Socket.IO client instance
    const lastServerSyncTimeRef = useRef(Date.now()); // To track when timer was last synced from server

    // Effect for Socket.IO connection and listeners
    useEffect(() => {
        socketRef.current = io(SOCKET_SERVER_URL); // NEW: Uses the variable

        socketRef.current.on('connect', () => {
            console.log('Connected to Socket.IO server!');
            if (sessionCode) {
                socketRef.current.emit('joinSession', sessionCode);
            }
        });

        socketRef.current.on('timerUpdate', (data) => {
            console.log('Received timerUpdate:', data);
            const { isRunning: serverIsRunning, timeLeft: serverTimeLeft } = data;

            setIsRunning(serverIsRunning);
            setTimeLeft(serverTimeLeft);
            lastServerSyncTimeRef.current = Date.now();

            if (serverIsRunning) {
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                }
                timerIntervalRef.current = setInterval(() => {
                    const elapsedTimeSinceLastSync = Date.now() - lastServerSyncTimeRef.current;
                    const newTimeLeft = serverTimeLeft - Math.floor(elapsedTimeSinceLastSync / 1000);

                    if (newTimeLeft <= 0) {
                        setTimeLeft(0);
                        setIsRunning(false);
                        clearInterval(timerIntervalRef.current);
                        timerIntervalRef.current = null;
                    } else {
                        setTimeLeft(newTimeLeft);
                    }
                }, 1000);
            } else {
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = null;
                }
            }
        });

        socketRef.current.on('timerReset', (data) => {
            console.log('Received timerReset:', data);
            setTimeLeft(0);
            setIsRunning(false);
            setCustomTime(''); // Clear custom input on reset
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [sessionCode]);

    // This effect ensures local interval is cleared when timer stops or runs out
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            // Interval is managed by `socket.on('timerUpdate')` to stay in sync with server
            // No need to set interval here again
        } else if ((!isRunning && timerIntervalRef.current) || (timeLeft <= 0 && timerIntervalRef.current)) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
            if (timeLeft <= 0) {
                setIsRunning(false);
            }
        }
    }, [isRunning, timeLeft]);

    // --- Teacher Control Functions (only callable if isAuthenticated) ---

    // Function to emit timer state to backend
    const emitTimerState = (running, time) => {
        if (isAuthenticated && socketRef.current) {
            socketRef.current.emit('startTimer', {
                sessionCode,
                isRunning: running,
                timeLeft: time
            });
        }
    };

    // New: Toggle the timer. When starting, if no time is set yet and a custom time is provided, use it.
    const toggleStartStop = () => {
        if (!isAuthenticated) return; // Only authenticated users can control

        if (!isRunning) {
            // On starting, if there's no preset time but a valid custom time is provided
            let timeToStart = timeLeft;
            if (timeLeft === 0 && customTime.trim() !== "") {
                const customSeconds = parseInt(customTime, 10) * 60;
                if (!isNaN(customSeconds) && customSeconds > 0) {
                    timeToStart = customSeconds;
                    setTimeLeft(customSeconds); // Update local state immediately
                }
            } else if (timeLeft === 0) {
                // If no time is set and no custom time, alert or do nothing.
                alert("Please set a time before starting the timer.");
                return;
            }
            setIsRunning(true);
            emitTimerState(true, timeToStart); // Emit the new state to the server
        } else {
            // Stopping (Pausing)
            setIsRunning(false);
            emitTimerState(false, timeLeft); // Emit the paused state to the server
        }
    };

    // New: Handle change in custom time input
    const handleCustomChange = (e) => {
        if (!isAuthenticated) return; // Only authenticated users can set custom time

        const val = e.target.value;
        setCustomTime(val); // Update customTime state

        // Calculate seconds from minutes for immediate display (if not running)
        const minutes = parseInt(val, 10);
        if (!isNaN(minutes) && minutes > 0) {
            // If timer is not running, immediately reflect the change
            if (!isRunning) {
                 setTimeLeft(minutes * 60);
                 // No need to emit here, emit only when starting/setting explicitly
            }
        } else if (!isRunning) {
            setTimeLeft(0); // If input is cleared or invalid and not running
        }
    };

    // New: Start timer with a preset duration (e.g., 5 min, 10 min)
    const startPresetTimer = (durationSeconds) => {
        if (!isAuthenticated) return; // Only authenticated users can start presets

        setTimeLeft(durationSeconds);
        setIsRunning(true);
        setCustomTime(''); // Clear custom input if a preset is used

        emitTimerState(true, durationSeconds); // Emit the preset start to the server
    };

    // Reset function (similar to before, but renamed for clarity)
    const handleResetTimer = () => {
        if (!isAuthenticated) return; // Only authenticated users can reset
        setTimeLeft(0);
        setIsRunning(false);
        setCustomTime('');
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        if (socketRef.current) {
            socketRef.current.emit('resetTimer', sessionCode);
        }
    };

    return (
        <div className="countdown-container">
            <h3>Countdown Timer</h3>
            {/* Conditional rendering for teacher controls */}
            {isAuthenticated && (
                <>
                    <button
                        onClick={toggleStartStop}
                        className={!isRunning ? "teacher-button-open" : "teacher-button-close"}
                    >
                        {!isRunning ? "Start" : "Stop"}
                    </button>
                    <button onClick={handleResetTimer}>Reset</button> {/* Add reset button */}
                </>
            )}

            {/* Timer display (visible to everyone) */}
            <TimerClock isRunning={isRunning} timeLeft={timeLeft}/>

            {/* Buttons and Custom Input (only for authenticated users) */}
            {isAuthenticated && (
                <div className="buttons">
                    <button onClick={() => startPresetTimer(5 * 60)}>5 Min</button>
                    <button onClick={() => startPresetTimer(10 * 60)}>10 Min</button>
                    <button onClick={() => startPresetTimer(15 * 60)}>15 Min</button>
                    <button onClick={() => startPresetTimer(20 * 60)}>20 Min</button>
                    <input
                        className="input-box-1"
                        type="number"
                        placeholder="Custom (minutes)"
                        value={customTime}
                        onChange={handleCustomChange}
                        min="0"
                    />
                </div>
            )}

            {!isAuthenticated && (
                <p>Waiting for the timer to be set and started by an authenticated user...</p>
            )}
        </div>
    );
};

export default CountdownTimerBoard;