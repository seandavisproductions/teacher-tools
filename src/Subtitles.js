import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client"; // Still needed if component can establish its own socket, but we'll pass socket

// Define the Socket.IO server URL (centralized constant is good practice)
const SOCKET_SERVER_URL = 'https://teacher-toolkit-back-end.onrender.com';

/**
 * Subtitles Component for both Teacher and Student views.
 * Handles microphone input (teacher), subtitle display, and language selection.
 *
 * @param {object} props
 * @param {object} props.socket The Socket.IO client instance, passed from parent.
 * @param {string} props.sessionCode The current session code.
 * @param {boolean} props.isTeacherView True if this is the teacher's view, false for student.
 */
export function Subtitles({ socket, sessionCode, isTeacherView }) {
  // State for microphone capture (teacher only)
  const [isCapturingAudio, setIsCapturingAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Language selection state
  // Teacher speaks in a language, students choose their translation language
  const [selectedLanguage, setSelectedLanguage] = useState(isTeacherView ? 'en-US' : 'en');

  // Subtitle text states
  const [currentRawSubtitle, setCurrentRawSubtitle] = useState(""); // Raw subtitle text from STT (teacher's spoken)
  const [displaySubtitle, setDisplaySubtitle] = useState(""); // The text actually displayed (raw for teacher, translated for student)

  // Pop-out display state
  const [showPopout, setShowPopout] = useState(false);

  // Debounce for student translation requests
  const translationRequestTimeoutRef = useRef(null);

  // Effect for handling Socket.IO subtitle events
  useEffect(() => {
    if (!socket || !sessionCode) {
      console.warn("Subtitles component: Socket or sessionCode not available.");
      return;
    }

    // Listener for incoming subtitle updates (raw text from backend STT)
    socket.on('subtitleUpdate', (data) => {
      // 'data' contains { text: string, isFinal: boolean }
      const receivedText = data.text;
      const isFinal = data.isFinal;

      setCurrentRawSubtitle(receivedText); // Always store the raw subtitle

      if (isTeacherView) {
        // Teacher displays the raw recognized text
        setDisplaySubtitle(receivedText);
      } else {
        // Student receives raw text, then requests translation
        // Debounce requests for interim results to save API calls
        if (isFinal) {
          requestTranslation(receivedText, selectedLanguage);
        } else {
          if (translationRequestTimeoutRef.current) {
            clearTimeout(translationRequestTimeoutRef.current);
          }
          translationRequestTimeoutRef.current = setTimeout(() => {
            requestTranslation(receivedText, selectedLanguage);
          }, 300);
        }
      }
    });

    // Listener for translated subtitle response (student only)
    if (!isTeacherView) {
      socket.on('translatedSubtitle', (translatedText) => {
        setDisplaySubtitle(translatedText); // Student displays the translated text
      });
    }

    // Listener for subtitle errors
    socket.on('subtitleError', (message) => {
      console.error('Subtitle error from server:', message);
      setDisplaySubtitle(`Error: ${message}`);
    });

    // Cleanup listeners on unmount or sessionCode change
    return () => {
      socket.off('subtitleUpdate');
      if (!isTeacherView) {
        socket.off('translatedSubtitle');
      }
      socket.off('subtitleError');
    };
  }, [socket, sessionCode, isTeacherView, selectedLanguage]); // Re-run if socket, session, view, or language changes

  // Function for teacher to start microphone input
  const startCapturingAudio = async () => {
    if (!socket || !sessionCode) {
        alert("Please ensure you are in a session before starting the microphone.");
        return;
    }
    if (isCapturingAudio) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          socket.emit('audioChunk', event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(250); // Send data every 250ms
      setIsCapturingAudio(true);
      socket.emit('startSpeechRecognition', selectedLanguage); // Send teacher's chosen language for STT
      console.log('Microphone started.');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please ensure permissions are granted.');
      setIsCapturingAudio(false);
    }
  };

  // Function for teacher to stop microphone input
  const stopCapturingAudio = () => {
    if (mediaRecorderRef.current && isCapturingAudio) {
      mediaRecorderRef.current.stop();
      setIsCapturingAudio(false);
      socket.emit('stopSpeechRecognition');
      setDisplaySubtitle(""); // Clear subtitle display on stop
      setCurrentRawSubtitle(""); // Also clear raw subtitle
      console.log('Microphone stopped.');
    }
  };

  // Function for student to request translation
  const requestTranslation = (text, targetLanguageCode) => {
      if (socket && text && targetLanguageCode) {
          socket.emit('requestTranslation', { text, targetLanguageCode });
      }
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    // If student, re-request translation for current subtitle if it exists
    if (!isTeacherView && currentRawSubtitle) {
        requestTranslation(currentRawSubtitle, newLang);
    }
    // Teacher's language change will apply to new speech recognition
  };


  // Language options for teacher (Google STT codes)
  const teacherLanguageOptions = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'es-ES', label: 'Spanish (Spain)' },
    { value: 'fr-FR', label: 'French (France)' },
    { value: 'de-DE', label: 'German (Germany)' },
    { value: 'ja-JP', label: 'Japanese (Japan)' },
    // Add more as needed, refer to Google Speech-to-Text docs
  ];

  // Language options for students (Google Translate codes)
  const studentLanguageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'zh', label: 'Chinese (Simplified)' },
    { value: 'ko', label: 'Korean' },
    { value: 'ar', label: 'Arabic' },
    // Add more as needed, refer to Google Translate docs (ISO 639-1)
  ];


  return (
    <>
      {/* Controls for Subtitles (language selector and start/stop button) */}
      <div className="subtitle-controls">
        <select value={selectedLanguage} onChange={handleLanguageChange}>
          {(isTeacherView ? teacherLanguageOptions : studentLanguageOptions).map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
        {isTeacherView && ( // Only show mic buttons for teacher
          <button onClick={isCapturingAudio ? stopCapturingAudio : startCapturingAudio}>
            {isCapturingAudio ? 'Stop Subtitles' : 'Start Subtitles'}
          </button>
        )}
        {/* Toggle button for pop-out subtitles */}
        <button onClick={() => setShowPopout(!showPopout)}>
          {showPopout ? 'Hide Pop-out' : 'Show Pop-out'}
        </button>
      </div>

      {/* Inline Subtitle Display */}
      {/* Only show inline if pop-out is off, and if subtitles are active (for teacher) or if any text is available (for student) */}
      {!showPopout && (isTeacherView ? isCapturingAudio : true) && (
          <div className="subtitle-inline-display">
              <p>{displaySubtitle || (isTeacherView ? "Microphone off or no speech" : "Waiting for teacher or translation...")}</p>
          </div>
      )}

      {/* Pop-out Subtitle Display */}
      {showPopout && (isTeacherView ? isCapturingAudio : true) && (
          <div className="popout-subtitle-container">
              <p>{displaySubtitle || (isTeacherView ? "Microphone off or no speech" : "Waiting for teacher or translation...")}</p>
              {/* Optional: Add a close button for the pop-out */}
              {/* <button className="popout-close-button" onClick={() => setShowPopout(false)}>X</button> */}
          </div>
      )}
    </>
  );
}