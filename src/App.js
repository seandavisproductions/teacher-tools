import { useState  } from "react";
import {TeacherView} from './TeacherView';
import {StudentView} from "./StudentView"; // Importing StudentView component
import Login from "./Login";


export default function App() {
  const [role, setRole] = useState(""); // Empty by default (not chosen yet)
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Tracks login status
  const [teacherId, setteacherId] = useState(null);
  const [sessionCode, setSessionCode] = useState(""); // Stores the teacher-generated code
  const [timeLeft, setTimeLeft] = useState(0); // Time in seconds

return (
    <div className="main-content">
      {!role ? (
        <div className="teacher-app">
          <img className="styled-image" src={`${process.env.PUBLIC_URL}/logo teacher toolkit.png`} alt="Teacher Toolkit"/>
          <h1>Choose Your Role</h1>
          <div className="buttons">
            
            <button onClick={() => setRole("teacher")}>Teacher</button>
            <button onClick={() => setRole("student")}>Student</button>
          </div>
        </div>
      ) : role === "teacher" ? (
        isAuthenticated ? (
          <TeacherView timeLeft={timeLeft} setTimeLeft={setTimeLeft} teacherId={teacherId} setteacherId={setteacherId} setSessionCode={setSessionCode} sessionCode={sessionCode}/>
        ) : (
          <Login setIsAuthenticated={setIsAuthenticated} teacherId={teacherId} setteacherId={setteacherId}  />
        )
      ) : (
        <StudentView timeLeft={timeLeft} teacherId={teacherId} setSessionCode={setSessionCode} sessionCode={sessionCode}/>
      )}
    </div>
  );
}

