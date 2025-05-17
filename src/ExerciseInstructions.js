import { useState } from "react";

export function ExerciseInstructions() {
  const [step, setStep] = useState(0);
  const [isStepsMode, setIsStepsMode] = useState(false);
  const [exercises, setExercises] = useState([{ exercise: "" }]);

  function handleSubmit() {
    setIsStepsMode(true); // Switch to flashcard mode
  }

  function addNewExercise() {
    setExercises([...exercises, { exercise: "" }]);
  }

  function handlePrevious() {
    if (step > 0) setStep((s) => s - 1);
  }

  function handleNext() {
    if (step < exercises.length - 1) setStep((s) => s + 1);
  }

  function handleChange(index, value) {
    setExercises((prevExercises) => prevExercises.map((ex, i) => i === index ? { ...ex, exercise: value } : ex
    )
    );
  }
  return (
    <div>
      {!isStepsMode ? (
        <div className="flashcards-container">
          <h3>Type the exercise instructions here</h3>

          {exercises.map((exercise, index) => (
            <div key={index}>
              <input
                className="input-box"
                type="text"
                placeholder="Enter exercise"
                value={exercise.exercise}
                onChange={(e) => handleChange(index, e.target.value)} />
            </div>
          ))}
          <button className="button" onClick={addNewExercise}>
            add another exercise here
          </button>
          <button className="button" onClick={handleSubmit}>
            Show in Steps
          </button>
        </div>
      ) : (
        <div className="steps">
          <button className="button" onClick={() => setIsStepsMode(false)}>
            Back to Edit Mode
          </button>
          <div className="message">
            Exercise {step + 1}: {exercises[step]?.exercise}
          </div>
          <div className="buttons">
            <button onClick={handlePrevious} disabled={step === 0}>
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={step === exercises.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
