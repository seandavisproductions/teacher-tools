import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from './context/SocketContext';

// REMOVE: No longer needed here as socket comes from context
// const SOCKET_SERVER_URL = 'https://teacher-toolkit-back-end.onrender.com';

/**
 * Subtitles Component for both Teacher and Student views.
 * Handles microphone input (teacher), subtitle display, and language selection.
 *
 * @param {object} props
 * @param {string} props.sessionCode The current session code.
 * @param {boolean} props.isTeacherView True if this is the teacher's view, false for student.
 */
export function Subtitles({ sessionCode, isTeacherView }) { // REMOVE 'socket' from props here
  // Get the socket instance from context
  const socket = useSocket(); // <--- Get the socket instance here!

  // State for microphone capture (teacher only)
  const [isCapturingAudio, setIsCapturingAudio] = useState(false);

  // Refs for AudioContext and stream management
  const mediaStreamRef = useRef(null); // Stores the MediaStream from getUserMedia
  const audioContextRef = useRef(null); // AudioContext instance
  const scriptProcessorRef = useRef(null); // ScriptProcessorNode for audio processing
  const mediaStreamSourceRef = useRef(null); // Source node from the audio stream

  // Language selection state
  const [selectedLanguage, setSelectedLanguage] = useState(isTeacherView ? 'en-US' : 'en');

  // Subtitle text states
  const [currentRawSubtitle, setCurrentRawSubtitle] = useState(""); // Raw subtitle text from STT (teacher's spoken)
  const [displaySubtitle, setDisplaySubtitle] = useState(""); // The text actually displayed (raw for teacher, translated for student)

  // Pop-out display state
  const [showPopout, setShowPopout] = useState(false);

  // Debounce for student translation requests (for interim results)
  const translationRequestTimeoutRef = useRef(null);

  // Effect for handling Socket.IO subtitle events
  useEffect(() => {
    // IMPORTANT: Check if socket is available before using it
    if (!socket || !sessionCode) {
      console.warn("Subtitles component: Socket or sessionCode not available (yet).");
      return;
    }

    console.log('Subtitles: Setting up Socket.IO listeners for session:', sessionCode);

    socket.on('subtitle', (data) => {
      console.log('Subtitles: Received subtitle data:', data);
      const receivedText = data.text;
      const isFinal = data.isFinal;
      const originalLanguage = data.language; // Language of the spoken text from the teacher

      setCurrentRawSubtitle(receivedText); // Always store the raw subtitle

      if (isTeacherView) {
        setDisplaySubtitle(receivedText); // Teacher displays the raw recognized text
      } else {
        // Student view: Check if server already provided translation for the student's chosen language
        if (data.translation && data.translation.language === selectedLanguage) {
             setDisplaySubtitle(data.translation.text);
        } else if (isFinal) {
             // If no server-side translation for chosen language, or if it's a final result, request it
             requestTranslation(receivedText, originalLanguage, selectedLanguage); // Pass original language
        } else {
             // For interim results, display raw text and debounce a translation request
             setDisplaySubtitle(receivedText);
             if (translationRequestTimeoutRef.current) {
                clearTimeout(translationRequestTimeoutRef.current);
             }
             translationRequestTimeoutRef.current = setTimeout(() => {
                 requestTranslation(receivedText, originalLanguage, selectedLanguage); // Pass original language
             }, 300);
        }
      }
    });

    if (!isTeacherView) {
      socket.on('translatedSubtitleResponse', (translatedText) => {
        setDisplaySubtitle(translatedText); // Student displays the translated text
        console.log('Subtitles: Received translatedSubtitleResponse:', translatedText);
      });
    }

    socket.on('subtitleError', (message) => {
      console.error('Subtitles: Subtitle error from server:', message);
      setDisplaySubtitle(`Error: ${message}`);
    });

    // Cleanup listeners on unmount or dependency change
    return () => {
      console.log('Subtitles: Cleaning up Socket.IO listeners.');
      if (socket) { // Ensure socket exists before removing listeners
        socket.off('subtitle');
        if (!isTeacherView) {
          socket.off('translatedSubtitleResponse');
        }
        socket.off('subtitleError');
      }
    };
  }, [socket, sessionCode, isTeacherView, selectedLanguage]); // currentRawSubtitle is now a state updated *within* this effect, so it's usually not a direct dependency.
                                                          // However, if your `requestTranslation` logic relies on `currentRawSubtitle` changing *outside* the effect,
                                                          // then you might put it back. For most cases, the `data.text` from the event is sufficient.

  // Function for teacher to start microphone input and recognition
  const startCapturingAudio = async () => {
    console.log('Subtitles: Attempting to start microphone...');
    // IMPORTANT: Check if socket is available and connected before using it
    if (!socket || !socket.connected || !sessionCode) {
        alert("Please ensure you are connected to the session before starting the microphone.");
        return;
    }
    if (isCapturingAudio) return; // Prevent multiple starts

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      mediaStreamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

      scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      scriptProcessorRef.current.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer.getChannelData(0);
        const data = new Int16Array(inputBuffer.length);
        for (let i = 0; i < inputBuffer.length; i++) {
          data[i] = Math.max(-1, Math.min(1, inputBuffer[i])) * 0x7FFF;
        }

        if (data.length > 0) {
            socket.emit('audioChunk', data.buffer); // Use `socket` directly
            // console.log('Subtitles: Emitting audioChunk. Data length:', data.length);
        }
      };

      mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
      scriptProcessorRef.current.connect(audioContextRef.current.destination);

      setIsCapturingAudio(true);
      socket.emit('startRecognition', { languageCode: selectedLanguage }); // Use `socket` directly
      console.log('Subtitles: Microphone started and startRecognition event emitted.');
    } catch (err) {
      console.error('Subtitles: Error accessing microphone:', err);
      alert(`Could not access microphone: ${err.message}. Please ensure permissions are granted and try again.`);
      setIsCapturingAudio(false);
      // Clean up resources if an error occurred during setup
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(track => track.stop());
      if (mediaStreamSourceRef.current) mediaStreamSourceRef.current.disconnect();
      if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
      if (audioContextRef.current) audioContextRef.current.close();
    }
  };

  // Function for teacher to stop microphone input and recognition
  const stopCapturingAudio = () => {
    console.log('Subtitles: Attempting to stop microphone...');
    // IMPORTANT: Check if socket is available and connected before using it
    if (!socket || !socket.connected) {
        console.warn("Subtitles: Socket not connected, cannot emit stopRecognition.");
        return;
    }
    if (isCapturingAudio) {
      if (mediaStreamSourceRef.current) mediaStreamSourceRef.current.disconnect();
      if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
      if (audioContextRef.current) audioContextRef.current.close();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }

      setIsCapturingAudio(false);
      socket.emit('stopRecognition'); // Use `socket` directly
      setDisplaySubtitle(""); // Clear subtitle display on stop
      setCurrentRawSubtitle(""); // Also clear raw subtitle
      console.log('Subtitles: Microphone stopped and stopRecognition event emitted.');
    }
  };

  // Function for student to request translation
  const requestTranslation = (text, sourceLanguageCode, targetLanguageCode) => {
      // IMPORTANT: Use the `socket` from `useSocket()` and check its availability
      if (socket && socket.connected && text && sourceLanguageCode && targetLanguageCode && !isTeacherView) {
          console.log(`Subtitles: Requesting translation for "${text}" from ${sourceLanguageCode} to ${targetLanguageCode}`);
          socket.emit('requestStudentTranslation', { text, sourceLanguageCode, targetLanguageCode }); // Use `socket` directly
      } else {
          console.warn('Subtitles: Socket not connected or missing data for translation request.');
      }
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    // If student, re-request translation for current raw subtitle if it exists
    if (!isTeacherView && currentRawSubtitle) {
        // This part needs `originalLanguage` which would ideally be stored along with `currentRawSubtitle`.
        // For now, assuming the original language was 'en-US' if not known, or fetching it from backend logic.
        // It's best if the `subtitle` event from the server includes the source language every time.
        // If the server sends `data.language` with the raw `subtitle` event, you should persist it.
        // For this refactor, we will pass 'en-US' as a placeholder or you would need to adjust your backend.
        requestTranslation(currentRawSubtitle, 'en-US', newLang); // <<< IMPORTANT: Adjust source language if not always 'en-US'
    }
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