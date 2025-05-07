import { Button } from "./Button";

export function Buttons({ tools, curOpen, setIsOpen }) {
  return (
    <div className="tool-buttons-container">
      {tools.map((el, i) => (
        <Button
          title={el.title}
          key={i}
          number={i + 1}
          curOpen={curOpen}
          setIsOpen={setIsOpen}
        ></Button>
      ))}
    </div>
  );
}
