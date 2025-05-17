import { useState, useEffect } from "react";

import {TeacherView} from './TeacherView';
import {StudentView} from "./StudentView"; // Importing StudentView component

export default function App() {
   const [role, setRole] = useState(""); // Empty by default (not chosen yet)
  const [sessionCode, setSessionCode] = useState(""); // Stores the teacher-generated code

  const generateCode = () => {
    const newCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    setSessionCode(newCode);
  };

  
  return (
<div className="main-content">
      {/* If no role is selected, show the role selection screen */}
      {!role ? (
        <div>
          <h2>Choose Your Role</h2>
          <button onClick={() => setRole("teacher")}>Teacher</button>
          <button onClick={() => setRole("student")}>Student</button>
        </div>
      ) : role === "teacher" ? (
        <TeacherView sessionCode={sessionCode} generateCode={generateCode} />
      ) : (
        <StudentView sessionCode={sessionCode} />
      )}
    </div>
  );
}

