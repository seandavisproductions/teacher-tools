import { useState } from "react";
import { TeacherView } from './TeacherView';
import { StudentView } from "./StudentView";
import { useSocket } from '.././context/SocketContext';


export default function App() {
  const [role, setRole] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teacherId, setteacherId] = useState(null);
  const [sessionCode, setSessionCode] = useState(""); // Stores the teacher-generated code
  const [timeLeft, setTimeLeft] = useState(0); // Time in seconds

  // You might want a loading state until the socket is established by SocketProvider
  // However, since it's an asynchronous connection, components might render first
  // and handle `socket` being null initially using `if (!socket)` checks.

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
      ) : (
        // Wrap your role-specific views with SocketProvider
        // Pass the sessionCode to the SocketProvider so it can manage joining the session
        <SocketProvider sessionCode={sessionCode}>
          {role === "teacher" ? (
            <TeacherView
              setIsAuthenticated={setIsAuthenticated}
              isAuthenticated={isAuthenticated}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              teacherId={teacherId}
              setteacherId={setteacherId}
              setSessionCode={setSessionCode}
              sessionCode={sessionCode}
            />
          ) : (
            <StudentView
              timeLeft={timeLeft}
              teacherId={teacherId}
              setSessionCode={setSessionCode}
              sessionCode={sessionCode}
            />
          )}
        </SocketProvider>
      )}
    </div>
  );
}