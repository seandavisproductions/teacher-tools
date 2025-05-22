import { useState, useEffect } from "react";
  
export function Welcome () {
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
    setTimeout(() => setIsVisible(true), 500); // Delay for smoother effect
}, []);

return (
    <div className={`fade-in ${isVisible ? "visible" : ""}`}>
    <h1 className="welcome">⬆️Click a tool above⬆️</h1>
    </div>
);
};