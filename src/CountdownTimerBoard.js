// src/CountdownTimerBoard.js
import React, { useState, useEffect, useRef } from 'react';
import { TimerClock } from "./TimerClock";
// REMOVED: import { useSocket } from './context/SocketContext'; // No longer needed for standalone timer

export const CountdownTimerBoard = () => { // sessionCode prop removed
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [customTime, setCustomTime] = useState('');

    const timerIntervalRef = useRef(null); // Ref to hold the interval ID for local countdown

    // This useEffect now manages only the local countdown interval
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerIntervalRef.current = setInterval(() => {
                setTimeLeft(prevTime => {
                    const newTime = prevTime - 1;
                    if (newTime <= 0) {
                        clearInterval(timerIntervalRef.current);
                        timerIntervalRef.current = null;
                        setIsRunning(false); // Stop running when time hits zero
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);
        } else if (!isRunning && timerIntervalRef.current) {
            // Clear interval if timer is stopped but interval is still active
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        // Cleanup: Clear interval when component unmounts or isRunning/timeLeft state changes
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [isRunning, timeLeft]); // Dependencies are now purely local state

    // Local Timer Control Functions (no server communication)
    const toggleStartStop = () => {
        if (!isRunning) { // If currently stopped, try to start
            let timeToStart = timeLeft;
            if (timeLeft === 0 && customTime.trim() !== "") {
                const customSeconds = parseInt(customTime, 10) * 60;
                if (!isNaN(customSeconds) && customSeconds > 0) {
                    timeToStart = customSeconds;
                }
            } else if (timeLeft === 0) {
                alert("Please set a time before starting the timer.");
                return;
            }

            // Start local timer
            setIsRunning(true);
            setTimeLeft(timeToStart); // Set to the initial time or current time
            // The useEffect above will pick up `isRunning` and start the interval
        } else { // If currently running, try to stop
            // Stop local timer
            setIsRunning(false);
            // The useEffect above will pick up `!isRunning` and clear the interval
        }
    };

    const handleCustomChange = (e) => {
        const val = e.target.value;
        setCustomTime(val);

        const minutes = parseInt(val, 10);
        if (!isNaN(minutes) && minutes > 0) {
            if (!isRunning) { // Only set time if not running to avoid interrupting
                 setTimeLeft(minutes * 60);
            }
        } else if (!isRunning) {
            setTimeLeft(0);
        }
    };

    const startPresetTimer = (durationSeconds) => {
        // Stop any running local timer first if one exists
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        setTimeLeft(durationSeconds);
        setIsRunning(true);
        setCustomTime(''); // Clear custom input when using preset
        // The useEffect above will pick up `isRunning` and start the interval
    };

    const handleResetTimer = () => {
        // Stop local timer
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        setTimeLeft(0);
        setIsRunning(false);
        setCustomTime(''); // Clear custom input on reset
    };

    return (
        <div className="countdown-container">
            <h3>Countdown Timer</h3>
            <>
                <button
                    onClick={toggleStartStop}
                    className={!isRunning ? "teacher-button-open" : "teacher-button-close"}
                >
                    {!isRunning ? "Start" : "Stop"}
                </button>
                <button onClick={handleResetTimer}>Reset</button>
            </>

            <TimerClock isRunning={isRunning} timeLeft={timeLeft}/>

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
        </div>
    );
};