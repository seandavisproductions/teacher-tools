import { Button } from "./Button";

export function Buttons({ tools, curOpen, setIsOpen, setCurOpen }) {
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
