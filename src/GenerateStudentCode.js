import { useState } from "react";
import { io } from "socket.io-client";
import { useEffect } from "react";
const socket = io("https://teacher-toolkit-back-end.onrender.com");



export function GenerateStudentCode({ teacherId }) {
    const [sessionCode, setSessionCode] = useState(""); // Stores the teacher-generated code
    // Listen for updates from the server (for example, if the teacher sends an update)
const handleGenerateCode = async () => {
    try {
      const response = await fetch("https://teacher-toolkit-back-end.onrender.com/session/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send only teacherId to the server for generating the session code
        body: JSON.stringify({ teacherId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to generate session code:", errorText);
        return;
      }

      const data = await response.json();
      // Assume your backend returns the generated code under data.session.code
      setSessionCode(data.session?.code || data.sessionCode || "");
      
      // Optionally, you can emit an update to inform other clients
      socket.emit("updateSession", { sessionCode: data.session?.code });
    } catch (error) {
      console.error("Error generating session code:", error);
    }
  };
    
      return (
    <div>
      <button className="button" onClick={handleGenerateCode} id="1">
        {!sessionCode ? 'Generate Student Code' : `Student Code: ${sessionCode}`}
      </button>
    </div>
  );
}