import { useState } from "react";
import { GenerateStudentCode } from "./GenerateStudentCode";

export function Header({ teacherId, setteacherId, sessionCode, setSessionCode, isAuthenticated, setIsAuthenticated}) {
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
     <button onClick={toggleFullscreen} className="button-fullscreen">
  <img className="styled-image fullscreen" src={`${process.env.PUBLIC_URL}/FullScreen Logo.png`} alt="Fullscreen" />
</button>
        <img className="styled-image logo" src={`${process.env.PUBLIC_URL}/logo teacher toolkit.png`} alt="Teacher Toolkit"/>
        <input
          className="input-text"
          type="text"
          placeholder="Objective: To understand how to use Teacher Toolkit"
          onChange={(e) => setObjective(e.target.value)}
        ></input>
          <GenerateStudentCode isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} teacherId={teacherId} setteacherId={setteacherId} sessionCode={sessionCode} setSessionCode={setSessionCode}/>
          
      </div>
    </div>
  );
}
