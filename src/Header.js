import { useState } from "react";
import { GenerateStudentCode } from "./GenerateStudentCode";

export function Header({ teacherId, setteacherId, sessionCode, setSessionCode}) {
  const [objective, setObjective] = useState("");

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen(); // Enter fullscreen
    } else {
      document.exitFullscreen(); // Exit fullscreen
    }
  }
  return (
    <div>
      <div className="header">
        <button
          onClick={toggleFullscreen}
          className="fullscreen-btn"
          style={{ alignItems: "flex-end" }}
        >
          🔳 Fullscreen
        </button>
        <h1>Teacher Toolkit</h1>
        Todays Objective:
        <input
          className="input-text"
          type="text"
          placeholder="e.g To understand how to use Teacher Toolkit"
          onChange={(e) => setObjective(e.target.value)}
        ></input>
          <GenerateStudentCode teacherId={teacherId} setteacherId={setteacherId} sessionCode={sessionCode} setSessionCode={setSessionCode}/>
          
      </div>
    </div>
  );
}
