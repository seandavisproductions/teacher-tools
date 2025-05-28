// src/Tools.js
import { Button } from "./ToolButton"; // Make sure this path is correct for ToolButton

export function Tools({ curOpen, setIsOpen, setCurOpen, onToolSelect }) {

  const tools = [
  { id: 'exercise-instructions', title: 'Exercise Instructions' },
  { id: 'presentation', title: 'Presentation' },
  { id: 'exit-ticket', 'title': 'Exit Ticket' },
  { id: 'sound-board', title: 'SoundBoard' },
  { id: 'quiz-builder', title: 'Quiz Builder' },
  { id: 'random-picker', title: 'Random Picker' },
  { id: 'group-maker', title: 'Group Maker' },
  { id: 'timer', title: 'Timer' },
  { id: 'whiteboard', title: 'Whiteboard' },
];
  return (
    <div className="tool-buttons-container">
      {tools.map((el, i) => (
        <Button
          title={el.title}
          key={el.id}
          number={i + 1}
          curOpen={curOpen}
          setIsOpen={setIsOpen}
          setCurOpen={setCurOpen}
          onToolSelect={onToolSelect}
          toolId={el.id}
        ></Button>
      ))}
    </div>
  );
}