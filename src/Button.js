export function Button({ title, curOpen, setIsOpen, number, setCurOpen }) {
  
  function handleToggle() {
    setCurOpen(curOpen === number ? null : number);
    console.log(number);
  }
  return (
    <div>
      <button
        className={curOpen === number ? "teacher-button-open" : "teacher-button-close"}
        onClick={handleToggle}
      >
        {title}
      </button>
    </div>
  );
}
