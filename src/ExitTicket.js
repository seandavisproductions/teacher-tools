import { useState } from "react";

export function ExitTicket({ qaList, setQaList }) {
  const [selectedId, setSelectedId] = useState(null);
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);

  function handleChange(index, field, value) {
    const updatedQaList = [...qaList];
    updatedQaList[index][field] = value;
    setQaList(updatedQaList);
  }

  function addNewQA() {
    setQaList([...qaList, { question: "", answer: "" }]);
  }

  function handleSubmit() {
    setIsFlashcardMode(true); // Switch to flashcard mode
  }

  function handleClick(index) {
    setSelectedId(index !== selectedId ? index : null);
  }

  return (
    <div>
      {!isFlashcardMode ? (
        <div className="flashcards-container">
          <h2>Enter Questions & Answers</h2>
          {qaList.map((qa, index) => (
            <div key={index}>
              <input
                className="input-box"
                type="text"
                placeholder="Enter question"
                value={qa.question}
                onChange={(e) => handleChange(index, "question", e.target.value)} />
              <input
                className="input-box"
                type="text"
                placeholder="Enter answer"
                value={qa.answer}
                onChange={(e) => handleChange(index, "answer", e.target.value)} />
            </div>
          ))}
          <button className="button" onClick={addNewQA}>
            Add More Questions
          </button>
          <button className="button" onClick={handleSubmit}>
            Flashcard Mode
          </button>
        </div>
      ) : (
        <>
          <button className="button" onClick={() => setIsFlashcardMode(false)}>
            Back to Edit Mode
          </button>
          <div className="flashcards">
            {qaList.map((qa, index) => (
              <div
                key={index}
                onClick={() => handleClick(index)}
                className={`flashcard ${selectedId === index ? "selected" : ""}`}
              >
                <p>{selectedId === index ? qa.answer : qa.question}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
