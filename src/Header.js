// src/Header.js
import React, { useState } from 'react'; // Make sure useState is imported
import { GenerateStudentCode } from "./GenerateStudentCode";
import { Subtitles } from "./subtitles";
import { Login } from './Login';
import { Register } from './Register'; // <--- Import Register component
// No need to import useSocket here unless Header itself directly uses it for non-child components

// Header now receives relevant state and setter functions from TeacherView
export function Header({ sessionCode, setSessionCode, teacherId, setTeacherId, onAuthAndSessionSuccess }) {
    // Determine if the user is "logged in" (has a teacherId)
    const isAuthenticated = !!teacherId;

    // State to toggle between Login and Register forms within Header
    const [showRegisterForm, setShowRegisterForm] = useState(false);

    // This function will be passed to Login/Register to close the modal or switch views
    // If you're using a modal for Login/Register, ensure this aligns with your modal logic.
    const closeModal = () => {
        // This might be a placeholder. If Login/Register are not in a modal,
        // this function might reset states or redirect instead.
        // For now, it could just ensure we're not showing register form if toggled back to login
        setShowRegisterForm(false); // Default to showing Login if this is called
    };

    return (
        <div className="header">
            {/* ... (other Header elements like fullscreen button, logo, objective input) ... */}

            {/* Authentication/Session Management Area */}
            {!isAuthenticated ? (
                // If not authenticated, show either the Register or Login form
                showRegisterForm ? (
                    <Register
                        closeModal={closeModal} // Pass a way to close or switch view if needed
                        // The Register component doesn't directly set auth state after registration,
                        // it nudges back to Login. So onAuthAndSessionSuccess is for Login.
                    />
                ) : (
                    <Login
                        onAuthSuccess={onAuthAndSessionSuccess} // Login will set the session/auth state
                        closeModal={closeModal} // Pass a way to close or switch view if needed
                        onSwitchToRegister={() => setShowRegisterForm(true)} // Allow Login to switch to Register
                    />
                )
            ) : (
                // If authenticated, show session details and controls
                <div>
                    <p>Logged in as: {teacherId}</p> {/* Display teacherId (or username if you have it) */}
                    {sessionCode ? (
                        <p>Your Session Code: <strong>{sessionCode}</strong></p>
                    ) : (
                        // If logged in but no session code yet, allow them to generate one
                        <GenerateStudentCode
                            teacherId={teacherId}
                            setSessionCode={setSessionCode} // GenerateStudentCode needs to update this state
                        />
                    )}
                </div>
            )}

            {/* Subtitles component - only show if a sessionCode is available (after login/generation) */}
            {sessionCode && (
                <Subtitles
                    sessionCode={sessionCode}
                    isTeacherView={true}
                />
            )}
            {/* ... rest of your Header elements ... */}
        </div>
    );
}