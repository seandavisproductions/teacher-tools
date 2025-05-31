// src/CountdownTimerBoard.js
import React, { useState, useEffect, useRef, useContext } from 'react'; // ADDED useContext
import { TimerClock } from "./TimerClock";
import { SocketContext } from './context/SocketContext'; // RE-ADDED this import!

export const CountdownTimerBoard = ({ sessionCode: propSessionCode }) => {
    // Get socket from context and use the prop sessionCode if provided
    const { socket, sessionCode: contextSessionCode, timerState } = useContext(SocketContext);
    // Use the prop sessionCode if provided, otherwise fall back to the context sessionCode
    const sessionCode = propSessionCode || contextSessionCode;

    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [customTime, setCustomTime] = useState('');

    const timerIntervalRef = useRef(null); // Ref to hold the interval ID for local countdown

    // Listen for timer state updates from the context
    useEffect(() => {
        if (timerState) {
            console.log('CountdownTimerBoard: Received timer state from context:', timerState);
            setIsRunning(timerState.isRunning);
            setTimeLeft(timerState.timeLeft);
        }
    }, [timerState]);

    // This useEffect now manages only the local countdown interval
    // IMPORTANT: For true server-client sync, you might want to adjust this to ALSO
    // listen for 'timerUpdate' events from the server on the teacher side too,
    // so the teacher's timer is always exactly what the server says.
    // For now, this local tick provides immediate visual feedback.
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
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [isRunning, timeLeft]);


    // Modified: Now communicates with the server
    const toggleStartStop = () => {
        if (!socket || !sessionCode) {
            console.warn("Socket or session code not available. Cannot send timer command to server.");
            return;
        }

        let timeToStart = timeLeft;
        if (!isRunning) { // If currently stopped, try to start
            if (timeLeft === 0 && customTime.trim() !== "") {
                const customSeconds = parseInt(customTime, 10) * 60;
                if (!isNaN(customSeconds) && customSeconds > 0) {
                    timeToStart = customSeconds;
                }
            } else if (timeLeft === 0) {
                alert("Please set a time before starting the timer.");
                return;
            }

            // Emit 'startTimer' to backend to START the timer
            console.log('CountdownTimerBoard: Emitting startTimer with sessionCode:', sessionCode);
            socket.emit('startTimer', {
                sessionCode: sessionCode, // Pass the correct session code
                isRunning: true, // Indicate the desire to start
                timeLeft: timeToStart // Pass the time to start from
            });
            
            // Request current timer state to ensure we're in sync
            socket.emit('requestTimerState', { sessionCode });

            // Update local state immediately for responsiveness
            setIsRunning(true);
            setTimeLeft(timeToStart);

        } else { // If currently running, try to stop
            // Emit 'startTimer' to backend to STOP the timer (backend's 'startTimer' handles both)
            socket.emit('startTimer', {
                sessionCode: sessionCode,
                isRunning: false, // Indicate the desire to stop
                timeLeft: timeLeft // Current time left for backend to pause at
            });

            // Update local state immediately for responsiveness
            setIsRunning(false);
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

    // Log on component render
  console.log(`CountdownTimerBoard Render: Session Code: ${sessionCode}, Socket connected: ${!!socket?.connected}`);

    const startPresetTimer = (durationSeconds) => {
 console.log(`--- PRESET BUTTON CLICKED ---`);
    console.log(`Preset: Current sessionCode: ${sessionCode} (Type: ${typeof sessionCode})`);
    console.log(`Preset: Socket status - exists: ${!!socket}, connected: ${!!socket?.connected}`);
    console.log(`Preset: Data to emit: { sessionCode: ${sessionCode}, isRunning: true, timeLeft: ${durationSeconds} }`);

        // Stop any running local timer first if one exists
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        setTimeLeft(durationSeconds);
        setIsRunning(true);
        setCustomTime('');

        // Emit to backend to START the timer with this preset
        if (socket && sessionCode) {
            socket.emit('startTimer', {
                sessionCode: sessionCode,
                isRunning: true,
                timeLeft: durationSeconds
            });
            
            // Request current timer state to ensure we're in sync
            setTimeout(() => {
                socket.emit('requestTimerState', { sessionCode });
            }, 500);
        }
    };

    // Modified: Now communicates with the server
    const handleResetTimer = () => {
        if (!socket || !sessionCode) {
            console.warn("Socket or session code not available. Cannot send timer reset to server.");
            return;
        }

        // Emit 'resetTimer' to backend
        console.log('CountdownTimerBoard: Emitting resetTimer with sessionCode:', sessionCode);
        socket.emit('resetTimer', { sessionCode }); // Send as an object for consistency

        // Update local state immediately for responsiveness
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        setTimeLeft(0);
        setIsRunning(false);
        setCustomTime('');
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
                <button className="button" onClick={handleResetTimer}>Reset</button>
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