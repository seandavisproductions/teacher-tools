import { useState, useEffect } from "react";
import {TeacherView} from './TeacherView';
import {StudentView} from "./StudentView"; // Importing StudentView component
import Login from "./Login";


export default function App() {
   const [role, setRole] = useState(""); // Empty by default (not chosen yet)
  const [sessionCode, setSessionCode] = useState(""); // Stores the teacher-generated code
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Tracks login status
  const [timeLeft, setTimeLeft] = useState(0); // Time in seconds

  const generateCode = () => {
    const newCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    setSessionCode(newCode);
  };

  
return (
    <div className="main-content">
      {!role ? (
        <div className="header">
          <h2>Choose Your Role</h2>
          <div className="buttons">
            <button onClick={() => setRole("teacher")}>Teacher</button>
            <button onClick={() => setRole("student")}>Student</button>
          </div>
        </div>
      ) : role === "teacher" ? (
        isAuthenticated ? (
          <TeacherView sessionCode={sessionCode} generateCode={generateCode} setSessionCode={setSessionCode} timeLeft={timeLeft} setTimeLeft={setTimeLeft}/>
        ) : (
          <Login setIsAuthenticated={setIsAuthenticated} />
        )
      ) : (
        <StudentView sessionCode={sessionCode} setSessionCode={setSessionCode} timeLeft={timeLeft}/>
      )}
    </div>
  );
}

