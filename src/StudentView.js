import { useState } from "react";

export const StudentView = ({ sessionCode }) => {
  const [inputCode, setInputCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleSubmit = () => {
    if (inputCode === sessionCode) {
      setIsAuthorized(true);
    } else {
      alert("Invalid code. Please try again.");
    }
  };

  return (
    <div>
      {!isAuthorized ? (
        <div>
          <h2>Enter Session Code</h2>
          <input 
            type="text" 
            value={inputCode} 
            onChange={(e) => setInputCode(e.target.value)}
          />
          <button onClick={handleSubmit}>Submit</button>
        </div>
      ) : (
        <h2>Welcome to the Student View!</h2>
      )}
    </div>
  );
};
