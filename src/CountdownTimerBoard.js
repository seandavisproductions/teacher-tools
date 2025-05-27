import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { TimerClock } from "./TimerClock"

// Replace with your backend URL
const SOCKET_SERVER_URL = 'https://teacher-toolkit-back-end.onrender.com';

export const CountdownTimerBoard = ({ sessionCode }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [customTime, setCustomTime] = useState('');

    const timerIntervalRef = useRef(null); // Ref to hold the interval ID for local countdown
    const socketRef = useRef(null); // Ref to hold the Socket.IO client instance
    const lastServerSyncTimeRef = useRef(Date.now()); // To track when timer was last synced from server

    // 1. Effect for Socket.IO connection and listeners
    // This effect connects the socket and handles server-initiated timer updates.
    useEffect(() => {
        socketRef.current = io(SOCKET_SERVER_URL);

        socketRef.current.on('connect', () => {
            console.log('Connected to Socket.IO server!');
            if (sessionCode) {
                socketRef.current.emit('joinSession', sessionCode);
            }
        });

        // This listener is critical for server-to-client synchronization
        socketRef.current.on('timerUpdate', (data) => {
            console.log('Received timerUpdate from server:', data);
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

        socketRef.current.on('timerReset', (data) => {
            console.log('Received timerReset from server:', data);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            setTimeLeft(0);
            setIsRunning(false);
            setCustomTime('');
        });

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server. Local timer may continue.');
            // Local timer will continue if it was running, as designed.
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error.message);
            // Local timer will continue if it was running, as designed.
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [sessionCode]); // Reconnect/rejoin if sessionCode changes

    // 2. Local Timer Control and Server Communication
    // This function handles the teacher's interaction (Start/Stop)
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

            // Emit to server to sync for other clients (and server-side robustness)
            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('startTimer', {
                    sessionCode,
                    isRunning: true,
                    timeLeft: timeToStart
                });
            } else {
                console.warn('Socket not connected, starting local timer only.');
            }

        } else { // If currently running, try to stop
            // Immediately stop local timer for responsiveness
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            setIsRunning(false);

            // Emit to server to sync for other clients
            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('startTimer', { // Use 'startTimer' with isRunning: false to signal stop
                    sessionCode,
                    isRunning: false,
                    timeLeft: timeLeft // Send current local timeLeft
                });
            } else {
                console.warn('Socket not connected, stopping local timer only.');
            }
        }
    };

    const handleCustomChange = (e) => {
        const val = e.target.value;
        setCustomTime(val);

        const minutes = parseInt(val, 10);
        if (!isNaN(minutes) && minutes > 0) {
            // Only update timeLeft if timer is not running
            if (!isRunning) {
                 setTimeLeft(minutes * 60);
            }
        } else if (!isRunning) { // If input is cleared and timer is not running
            setTimeLeft(0);
        }
    };

    const startPresetTimer = (durationSeconds) => {
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
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('startTimer', {
                sessionCode,
                isRunning: true,
                timeLeft: durationSeconds
            });
        } else {
            console.warn('Socket not connected, starting local preset timer only.');
        }
    };

    const handleResetTimer = () => {
        // Immediately reset local timer
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        setTimeLeft(0);
        setIsRunning(false);
        setCustomTime('');

        // Emit to server
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('resetTimer', sessionCode);
        } else {
            console.warn('Socket not connected, resetting local timer only.');
        }
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