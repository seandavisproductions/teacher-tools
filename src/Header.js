// src/Header.js
import React, { useState } from 'react';
import { GenerateStudentCode } from "./GenerateStudentCode";
import { Subtitles } from "./Subtitles";
import { Login } from './Login';      // Make sure Login is imported
import { Register } from './Register'; // Make sure Register is imported


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

    // This function wraps onAuthAndSessionSuccess. It is called by Login/Register
    // after a successful login/registration.
    const handleAuthSuccessAndHideForm = (code, id) => {
        onAuthAndSessionSuccess(code, id); // Propagate success details up to TeacherView
        setShowAuthSection(false); // Hide the auth section after successful login
        setShowRegisterForm(false); // Reset to login view for next time
    };

    return (
        <div> {/* This outer div was explicitly requested by you */}
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
                    value={objective} // Controlled component
                    onChange={(e) => setObjective(e.target.value)}
                ></input>

                {/* Authentication/Session Management Area - This is where the Login/Register logic is */}
                {!isAuthenticated ? ( // If the user is NOT authenticated
                    // If the auth section is currently hidden, show the "Login/Register" button
                    !showAuthSection ? (
                        <button className="button"onClick={() => setShowAuthSection(true)}>
                            Login / Register
                        </button>
                    ) : ( // Else (auth section is visible), show either Login or Register form
                        showRegisterForm ? (
                            <Register
                                closeModal={() => setShowRegisterForm(false)} // Allows Register to switch back to Login view
                                onAuthAndSessionSuccess={handleAuthSuccessAndHideForm}
                            />
                        ) : (
                            <Login
                                onAuthSuccess={handleAuthAndSessionSuccess}
                                closeModal={handleCloseAuthForms} // 'x' button in Login hides the whole section
                                onSwitchToRegister={handleSwitchToRegister} // This is the prop Login needs
                            />
                        )
                    )
                ) : ( // If the user IS authenticated
                    // Show session details and controls, or GenerateStudentCode
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
                        {/* The "Change Role" button is now moved outside this block */}
                    </div>
                )}

                {/* NEW LOCATION: Place the Change Role button here, outside the isAuthenticated block.
                    It will always be visible as long as onResetRole is provided (from TeacherView). */}
                {onResetRole && (
                    <button onClick={onResetRole} className="button change-role-button">
                        Change Role
                    </button>
                )}
            </div>

            {/* Subtitles component - conditionally rendered if sessionCode exists */}
            {sessionCode && (
                <Subtitles
                    sessionCode={sessionCode}
                    isTeacherView={true}
                />
            )}
        </div>
    );
}