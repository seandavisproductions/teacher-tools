import { useState  } from "react";
import {TeacherView} from './TeacherView';
import {StudentView} from "./StudentView"; // Importing StudentView component
import Login from "./Login";


export default function App() {
  const [role, setRole] = useState(""); // Empty by default (not chosen yet)
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Tracks login status
  const [timeLeft, setTimeLeft] = useState(0); // Time in seconds
  const [sessionId, setsessionId] = useState(null);

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
          <TeacherView timeLeft={timeLeft} setTimeLeft={setTimeLeft} sessionId={sessionId} setsessionId={setsessionId}/>
        ) : (
          <Login setIsAuthenticated={setIsAuthenticated} sessionId={sessionId} setsessionId={setsessionId} />
        )
      ) : (
        <StudentView timeLeft={timeLeft} sessionId={sessionId}/>
      )}
    </div>
  );
}

