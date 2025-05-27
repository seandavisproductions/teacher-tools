import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { TimerClock } from "./TimerClock"

// Replace with your backend URL
const SOCKET_SERVER_URL = 'https://teacher-toolkit-back-end.onrender.com'; // Or your Render backend URL

export const CountdownTimerBoard = ({ isAuthenticated, sessionCode }) => { // Keep isAuthenticated prop for backend emits
    const [timeLeft, setTimeLeft] = useState(0); // Current time left in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [customTime, setCustomTime] = useState(''); // Holds custom minutes input

    const timerIntervalRef = useRef(null); // Ref to hold the interval ID for local countdown
    const socketRef = useRef(null); // Ref to hold the Socket.IO client instance
    const lastServerSyncTimeRef = useRef(Date.now()); // To track when timer was last synced from server

    // Effect for Socket.IO connection and listeners
    useEffect(() => {
        socketRef.current = io(SOCKET_SERVER_URL);

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

    // --- Control Functions (now callable by anyone seeing the buttons) ---
    // HOWEVER, it's CRITICAL to have backend authorization if only authenticated users should truly control.

    // Function to emit timer state to backend
    const emitTimerState = (running, time) => {
        // We still pass isAuthenticated here to the backend for backend authorization
        // but the frontend button visibility no longer depends on it.
        if (socketRef.current) {
            socketRef.current.emit('startTimer', {
                sessionCode,
                isRunning: running,
                timeLeft: time,
                // You might still want to send isAuthenticated to the backend
                // so the backend can authorize the action
                // isAuthenticated: isAuthenticated // This would be part of your session/JWT on backend
            });
        }
    };

    const toggleStartStop = () => {
        // The frontend button is visible, but the backend SHOULD still validate permissions.
        if (!isRunning) {
            let timeToStart = timeLeft;
            if (timeLeft === 0 && customTime.trim() !== "") {
                const customSeconds = parseInt(customTime, 10) * 60;
                if (!isNaN(customSeconds) && customSeconds > 0) {
                    timeToStart = customSeconds;
                    setTimeLeft(customSeconds);
                }
            } else if (timeLeft === 0) {
                alert("Please set a time before starting the timer.");
                return;
            }
            setIsRunning(true);
            emitTimerState(true, timeToStart);
        } else {
            setIsRunning(false);
            emitTimerState(false, timeLeft);
        }
    };

    const handleCustomChange = (e) => {
        const val = e.target.value;
        setCustomTime(val);

        const minutes = parseInt(val, 10);
        if (!isNaN(minutes) && minutes > 0) {
            if (!isRunning) {
                 setTimeLeft(minutes * 60);
            }
        } else if (!isRunning) {
            setTimeLeft(0);
        }
    };

    const startPresetTimer = (durationSeconds) => {
        setTimeLeft(durationSeconds);
        setIsRunning(true);
        setCustomTime('');

        emitTimerState(true, durationSeconds);
    };

    const handleResetTimer = () => {
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

            {/* All controls are now always visible */}
            <>
                <button
                    onClick={toggleStartStop}
                    className={!isRunning ? "teacher-button-open" : "teacher-button-close"}
                >
                    {!isRunning ? "Start" : "Stop"}
                </button>
                <button onClick={handleResetTimer}>Reset</button>
            </>

            {/* Timer display (visible to everyone) */}
            <TimerClock isRunning={isRunning} timeLeft={timeLeft}/>

            {/* Buttons and Custom Input (always visible) */}
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

            {/* The previous message for non-authenticated users is now removed as buttons are visible */}
            {/* {!isAuthenticated && (
                <p>Waiting for the timer to be set and started by an authenticated user...</p>
            )} */}
        </div>
    );
};
