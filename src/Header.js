// src/Header.js
import React, { useState } from 'react';
import { GenerateStudentCode } from "./GenerateStudentCode";
import { Subtitles } from "./Subtitles";
import { Login } from './Login';
import { Register } from './Register';


export function Header({ sessionCode, setSessionCode, teacherId, setTeacherId, onAuthAndSessionSuccess, onResetRole }) {
    const isAuthenticated = !!teacherId;
    // State to toggle between Login and Register forms within the auth section
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    // State to control overall visibility of the Login/Register forms section
    const [showAuthSection, setShowAuthSection] = useState(false); // Initially hidden

    // Local state for the objective input field
    const [objective, setObjective] = useState('');

    // Function for fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    // This function is passed to Login.js and Register.js as 'closeModal'.
    // It's used when the user clicks 'x' or finishes an action.
    const handleCloseAuthForms = () => {
        setShowRegisterForm(false); // Default to login view if closing
        setShowAuthSection(false); // Hide the entire auth section
    };

    // This function is passed to Login.js as 'onSwitchToRegister'.
    // It tells Header to show the Register form.
    const handleSwitchToRegister = () => {
        setShowRegisterForm(true);
    };

    // --- NEW: This function is passed to Register.js as 'onSwitchToLogin'. ---
    // It tells Header to show the Login form.
    const handleSwitchToLogin = () => {
        setShowRegisterForm(false); // Switch back to the login view
    };

    // This function wraps onAuthAndSessionSuccess. It is called by Login/Register
    // after a successful login/registration.
    const handleAuthSuccessAndHideForm = (code, id) => {
        onAuthAndSessionSuccess(code, id); // Propagate success details up to TeacherView
        setShowAuthSection(false); // Hide the auth section after successful login
        setShowRegisterForm(false); // Reset to login view for next time
    };

    return (
        <div>
            <div className="header">
                {/* Fullscreen button */}
                <button onClick={toggleFullscreen} className="button-fullscreen">
                    <img className="styled-image fullscreen" src={`${process.env.PUBLIC_URL}/FullScreen Logo.png`} alt="Fullscreen" />
                </button>

                {/* Logo */}
                <img className="styled-image logo" src={`${process.env.PUBLIC_URL}/logo teacher toolkit.png`} alt="Teacher Toolkit"/>

                {/* Objective Input */}
                <input
                    className="input-text"
                    type="text"
                    placeholder="Objective: To understand how to use Teacher Toolkit"
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                ></input>

                {/* Authentication/Session Management Area */}
                {!isAuthenticated ? (
                    !showAuthSection ? (
                        <button className="button"onClick={() => setShowAuthSection(true)}>
                            Login / Register
                        </button>
                    ) : (
                        showRegisterForm ? (
                            <Register
                                closeModal={handleCloseAuthForms} // Use consistent close handler
                                onAuthAndSessionSuccess={handleAuthSuccessAndHideForm}
                                onSwitchToLogin={handleSwitchToLogin} 
                            />
                        ) : (
                           <Login
                                onAuthSuccess={handleAuthSuccessAndHideForm}
                                closeModal={handleCloseAuthForms}
                                onSwitchToRegister={handleSwitchToRegister}
                            />
                        )
                    )
                ) : (
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

                {onResetRole && (
                    <button onClick={onResetRole} className="button change-role-button">
                        Change Role
                    </button>
                )}
            </div>

            {sessionCode && (
                <Subtitles
                    sessionCode={sessionCode}
                    isTeacherView={true}
                />
            )}
        </div>
    );
}