import { useState, useEffect } from "react";
  
export function FadeInComponent () {
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
    setTimeout(() => setIsVisible(true), 500); // Delay for smoother effect
}, []);

return (
    <div className={`fade-in ${isVisible ? "visible" : ""}`}>
    <h1 className="welcome">Welcome to the Teacher Toolkit. Click a tool above to start!</h1>
    </div>
);
};