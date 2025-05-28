// src/ToolButton.js
import React from 'react';

// Added toolId prop
export function Button({ title, curOpen, setIsOpen, number, setCurOpen, onToolSelect, toolId }) {
  function handleToggleAndSelect() {
    const newCurOpenState = curOpen === number ? null : number;

    setCurOpen(newCurOpenState);

    if (onToolSelect) {
      onToolSelect(newCurOpenState === null ? null : toolId);
    }
  }

  return (
    <div>
      <button
        className={curOpen === number ? "teacher-button-open" : "teacher-button-close"}
        onClick={handleToggleAndSelect}
      >
        {title}
      </button>
    </div>
  );
}