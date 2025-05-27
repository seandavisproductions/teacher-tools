import { Button } from "./Button";

export function Buttons({ curOpen, setIsOpen, setCurOpen }) {


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
  { id: 'feedback-collector', title: 'Feedback Collector' },
];
  return (
    <div className="tool-buttons-container">
      {tools.map((el, i) => (
        <Button
          title={el.title}
          key={i}
          number={i + 1}
          curOpen={curOpen}
          setIsOpen={setIsOpen}
          setCurOpen={setCurOpen}
        ></Button>
      ))}
    </div>
  );
}
