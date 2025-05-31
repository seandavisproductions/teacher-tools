import React, { useState } from 'react';
// import { GenerateStudentCode } from "./GenerateStudentCode"; // REMOVED: This component is no longer directly used here for session code generation/display
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

    // This function is passed to Register.js as 'onSwitchToLogin'.
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

    // --- NEW FUNCTION: To handle generating/refreshing session code ---
    const handleRefreshSessionCode = async () => {
        if (!teacherId) {
            console.warn('Cannot refresh session code: Teacher not logged in.');
            return;
        }

        const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage

        if (!token) {
            console.error('No authentication token found. Please log in.');
            alert('You must be logged in to generate a new session code.'); // Provide user feedback
            return;
        }

        try {
            // Make API call to your backend endpoint for generating a new code
            // IMPORTANT: Ensure this URL matches your Render backend URL + the new route path
            // Example: 'https://your-backend-service.onrender.com/auth/generate-new-session-code'
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/generate-new-session-code`, {
                method: 'POST', // Use POST as you are changing state on the server
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Send the JWT token
                },
                // No body needed for this request if teacherId comes from token
            });

            const data = await response.json();

            if (response.ok) {
                console.log('New session code received:', data.sessionCode);
                setSessionCode(data.sessionCode); // Update the session code in state
                // Optional: Provide visual feedback to the user
                // alert(`Your new session code is: ${data.sessionCode}`); 
            } else {
                console.error('Failed to generate new session code:', data.message || 'Server error');
                alert('Failed to generate new session code: ' + (data.message || 'Please try again.'));
            }
        } catch (error) {
            console.error('Error refreshing session code:', error);
            alert('Error refreshing session code. Please check your network or try again.');
        }
    };

    return (
        <div>
            <div className="header">
                {/* Fullscreen button */}
                <button onClick={toggleFullscreen} className="button-fullscreen">
                    <img className="styled-image fullscreen" src={`${process.env.PUBLIC_URL}/FullScreen_Logo.png`} alt="Full Screen Logo"/>
                </button>

                {/* Logo */}
                <img className="styled-image logo" src={`${process.env.PUBLIC_URL}/teacher_toolkit_logo_only.png`} alt="Teacher Toolkit"/>

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
                    // Display Login/Register buttons or forms when not authenticated
                    !showAuthSection ? (
                        <button className="button"onClick={() => setShowAuthSection(true)}>
                            Login / Register
                        </button>
                    ) : (
                        showRegisterForm ? (
                            <Register
                                closeModal={handleCloseAuthForms} 
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
                    // --- MODIFIED AUTHENTICATED SECTION ---
                    <div className="authenticated-actions">
                        {/* REMOVED: The line <p>Logged in as: {teacherId}</p> is removed */}
                        
                        {/* Session Code Display Button */}
                        <button 
                            className="button session-code-button" 
                            onClick={handleRefreshSessionCode}
                        >
                            Session Code: <strong>{sessionCode || 'Generating...'}</strong> (Click to Refresh)
                        </button>
                        
                        {/* The GenerateStudentCode component is no longer used here as the new button
                            handles both display and refresh. */}

                        {/* Example of where to put other teacher-specific authenticated content if needed */}
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