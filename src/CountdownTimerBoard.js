import React, { useState, useEffect, useRef } from 'react';
import { TimerClock } from "./TimerClock"
import { useSocket } from '../../context/SocketContext'; // Import the useSocket hook

// REMOVE: No longer needed here as socket comes from context
// const SOCKET_SERVER_URL = 'https://teacher-toolkit-back-end.onrender.com';

export const CountdownTimerBoard = ({ sessionCode }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [customTime, setCustomTime] = useState('');

    const timerIntervalRef = useRef(null); // Ref to hold the interval ID for local countdown
    // REMOVE: No longer need socketRef as useSocket will provide the instance
    // const socketRef = useRef(null);
    const lastServerSyncTimeRef = useRef(Date.now()); // To track when timer was last synced from server

    // 1. Get the socket instance from context
    const socket = useSocket(); // <-- This is where you get the socket!

    // Effect for Socket.IO listeners
    // This effect now ONLY focuses on setting up listeners on the shared socket.
    useEffect(() => {
        // IMPORTANT: Ensure the socket is available before trying to set up listeners
        if (!socket || !sessionCode) {
            console.warn("CountdownTimerBoard: Socket or sessionCode not available (yet).");
            return;
        }

        console.log('CountdownTimerBoard: Setting up Socket.IO listeners for session:', sessionCode);

        // This listener is critical for server-to-client synchronization
        socket.on('timerUpdate', (data) => {
            console.log('CountdownTimerBoard: Received timerUpdate from server:', data);
            const { isRunning: serverIsRunning, timeLeft: serverTimeLeft } = data;

            // Stop local interval first to prevent conflicts
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }

            // Always update state based on server's truth
            setIsRunning(serverIsRunning);
            setTimeLeft(serverTimeLeft);
            lastServerSyncTimeRef.current = Date.now();

            // If server says timer is running, start local interval again
            if (serverIsRunning && serverTimeLeft > 0) {
                timerIntervalRef.current = setInterval(() => {
                    setTimeLeft(prevTime => {
                        const newTime = prevTime - 1;
                        if (newTime <= 0) {
                            clearInterval(timerIntervalRef.current);
                            timerIntervalRef.current = null;
                            setIsRunning(false);
                            return 0;
                        }
                        return newTime;
                    });
                }, 1000);
            }
        });

        socket.on('timerReset', (data) => {
            console.log('CountdownTimerBoard: Received timerReset from server:', data);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            setTimeLeft(0);
            setIsRunning(false);
            setCustomTime('');
        });

        // Cleanup: Remove listeners when component unmounts or socket/sessionCode changes
        return () => {
            console.log('CountdownTimerBoard: Cleaning up Socket.IO listeners.');
            if (socket) { // Ensure socket exists before removing listeners
                socket.off('timerUpdate');
                socket.off('timerReset');
            }
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [socket, sessionCode]); // Dependencies now include `socket` itself

    // 2. Local Timer Control and Server Communication
    // These functions now use the `socket` variable from `useSocket()` directly.
    const toggleStartStop = () => {
        // IMPORTANT: Check if socket is connected before emitting
        if (!socket || !socket.connected) {
            console.warn('Socket not connected, cannot sync timer with server.');
            alert('Cannot start/stop timer: Not connected to real-time services.');
            return;
        }

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

            // Immediately start local timer for responsiveness
            setIsRunning(true);
            setTimeLeft(timeToStart);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
            timerIntervalRef.current = setInterval(() => {
                setTimeLeft(prevTime => {
                    const newTime = prevTime - 1;
                    if (newTime <= 0) {
                        clearInterval(timerIntervalRef.current);
                        timerIntervalRef.current = null;
                        setIsRunning(false);
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);

            // Emit to server
            socket.emit('startTimer', { // Use `socket` directly
                sessionCode,
                isRunning: true,
                timeLeft: timeToStart
            });

        } else { // If currently running, try to stop
            // Immediately stop local timer for responsiveness
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            setIsRunning(false);

            // Emit to server
            socket.emit('startTimer', { // Use `socket` directly
                sessionCode,
                isRunning: false,
                timeLeft: timeLeft // Send current local timeLeft
            });
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
        // IMPORTANT: Check if socket is connected before emitting
        if (!socket || !socket.connected) {
            console.warn('Socket not connected, cannot sync timer with server.');
            alert('Cannot start preset timer: Not connected to real-time services.');
            return;
        }

        // Stop any running local timer first
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }

        // Immediately start local timer
        setTimeLeft(durationSeconds);
        setIsRunning(true);
        setCustomTime('');

        timerIntervalRef.current = setInterval(() => {
            setTimeLeft(prevTime => {
                const newTime = prevTime - 1;
                if (newTime <= 0) {
                    clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = null;
                    setIsRunning(false);
                    return 0;
                }
                return newTime;
            });
        }, 1000);

        // Emit to server
        socket.emit('startTimer', { // Use `socket` directly
            sessionCode,
            isRunning: true,
            timeLeft: durationSeconds
        });
    };

    const handleResetTimer = () => {
        // IMPORTANT: Check if socket is connected before emitting
        if (!socket || !socket.connected) {
            console.warn('Socket not connected, cannot sync timer with server.');
            alert('Cannot reset timer: Not connected to real-time services.');
            return;
        }

        // Immediately reset local timer
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        setTimeLeft(0);
        setIsRunning(false);
        setCustomTime('');

        // Emit to server
        socket.emit('resetTimer', sessionCode); // Use `socket` directly
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