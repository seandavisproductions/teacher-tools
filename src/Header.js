// src/Header.js
import React, { useState } from 'react';
import { GenerateStudentCode } from "./GenerateStudentCode";
import { Subtitles } from "./Subtitles";
import { Login } from './Login';
import { Register } from './Register';


export function Header({ sessionCode, setSessionCode, teacherId, setTeacherId, onAuthAndSessionSuccess }) {
    const isAuthenticated = !!teacherId;
    const [showRegisterForm, setShowRegisterForm] = useState(false);

    const closeModal = () => {
        setShowRegisterForm(false);
    };

    // This callback is for the Login component to tell Header to switch to Register form
    const handleSwitchToRegister = () => {
        setShowRegisterForm(true);
    };

    return (
        <div className="header">
            {/* ... (other Header elements) ... */}

            {!isAuthenticated ? (
                // If not authenticated, show either the Register or Login form
                showRegisterForm ? (
                    <Register
                        closeModal={closeModal}
                        onAuthAndSessionSuccess={onAuthAndSessionSuccess} // Pass this down to Register
                        // Register's internal Login does NOT need onSwitchToRegister,
                        // as its own 'Back to login' button handles the switch locally.
                    />
                ) : (
                    <Login
                        onAuthSuccess={onAuthAndSessionSuccess}
                        closeModal={closeModal}
                        onSwitchToRegister={handleSwitchToRegister} // Pass this to Login
                    />
                )
            ) : (
                // If authenticated, show session details and controls
                <div>
                    <p>Logged in as: {teacherId}</p>
                    {sessionCode ? (
                        <p>Your Session Code: <strong>{sessionCode}</strong></p>
                    ) : (
                        <GenerateStudentCode
                            teacherId={teacherId}
                            setSessionCode={setSessionCode}
                        />
                    )}
                </div>
            )}

            {sessionCode && (
                <Subtitles
                    sessionCode={sessionCode}
                    isTeacherView={true}
                />
            )}
        </div>
    );
}