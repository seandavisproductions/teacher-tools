import { useState } from "react";
import "./App.css";
import "./index.css";

const tools = [
  { title: "Exercise Instructions", id: 1 },
  {
    title: "Countdown Timer",
    id: 2,
  },

  { title: "Translation", id: 3 },
  { title: "Exit Ticket", id: 4 },
];

export default function App() {
  const [button, setButton] = useState(false);
  const [curOpen, setIsOpen] = useState(null);
  const [qaList, setQaList] = useState([
    { question: "", answer: "" },
    { question: "", answer: "" },
    { question: "", answer: "" },
  ]);
  const [exercises, setExercises] = useState([{ exercise: "" }]);
  return (
    <div className="">
      <Header tools={tools} />
      <Buttons tools={tools} curOpen={curOpen} setIsOpen={setIsOpen} />
      {curOpen === 1 && (
        <ExerciseInstructions
          exercises={exercises}
          setExercises={setExercises}
        />
      )}
      {curOpen === 2 && <CountdownTimer />}
      {curOpen === 3 && <Translation />}
      {curOpen === 4 && <ExitTicket qaList={qaList} setQaList={setQaList} />}
      <Footer />
    </div>
  );
}

function Header({ tools }) {
  const [objective, setObjective] = useState("");

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen(); // Enter fullscreen
    } else {
      document.exitFullscreen(); // Exit fullscreen
    }
  }

  return (
    <div className="header">
      <button
        onClick={toggleFullscreen}
        className="fullscreen-btn"
        style={{ alignItems: "flex-end" }}
      >
        🔳 Fullscreen
      </button>
      <h1>Teacher Toolkit</h1>
      Todays Objective:
      <input
        className="input-text"
        type="text"
        placeholder="e.g To understand how variables work in programming"
        onChange={(e) => setObjective(e.target.value)}
      ></input>
    </div>
  );
}

function Buttons({ tools, curOpen, setIsOpen }) {
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

function Button({ title, curOpen, setIsOpen, number }) {
  function handleToggle() {
    setIsOpen(curOpen === number ? null : number);
    console.log(number);
  }
  return (
    <div>
      <button
        className={
          curOpen === number ? "teacher-button-open" : "teacher-button-close"
        }
        onClick={handleToggle}
      >
        {title}
      </button>
    </div>
  );
}

function ExerciseInstructions({ exercises, setExercises }) {
  const [step, setStep] = useState(0);
  const [isStepsMode, setIsStepsMode] = useState(false);

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
    setExercises((prevExercises) =>
      prevExercises.map((ex, i) =>
        i === index ? { ...ex, exercise: value } : ex
      )
    );
  }
  return (
    <div>
      {!isStepsMode ? (
        <div className="flashcards-container">
          <h3>What would you like your first exercise to be?</h3>

          {exercises.map((exercise, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder="Enter exercise"
                value={exercise.exercise}
                onChange={(e) => handleChange(index, e.target.value)}
              />
            </div>
          ))}
          <button onClick={addNewExercise}>add another exercise here</button>
          <button onClick={handleSubmit}>Show in Steps</button>
        </div>
      ) : (
        <div className="steps">
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

function CountdownTimer() {
  return (
    <div>
      <UnderDevelopment />;
    </div>
  );
}

function Translation() {
  return (
    <div>
      <UnderDevelopment />
    </div>
  );
}

function Footer() {
  return (
    <div className="footer">
      Designed by{" "}
      <a href="https://www.seandavisproductions.co.uk">
        Sean Davis Productions
      </a>{" "}
      using React
    </div>
  );
}

function ExitTicket({ qaList, setQaList }) {
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
                type="text"
                placeholder="Enter question"
                value={qa.question}
                onChange={(e) =>
                  handleChange(index, "question", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Enter answer"
                value={qa.answer}
                onChange={(e) => handleChange(index, "answer", e.target.value)}
              />
            </div>
          ))}
          <button onClick={addNewQA}>Add More Questions</button>
          <button onClick={handleSubmit}>Submit</button>
        </div>
      ) : (
        <>
          <button onClick={() => setIsFlashcardMode(false)}>
            Back to Edit Mode
          </button>
          <div className="flashcards">
            {qaList.map((qa, index) => (
              <div
                key={index}
                onClick={() => handleClick(index)}
                className={`flashcard ${
                  selectedId === index ? "selected" : ""
                }`}
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

function UnderDevelopment() {
  const randomList = [
    {
      image: "https://media1.tenor.com/m/bUa1N-13OecAAAAC/baby-run-omg.gif",
      text: "Whoops! Hold tight. I'm currently coding. I'll be right back.",
    },
    {
      image:
        "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWc2MHZxYTNuOHdubXo4MTR0OGpucjJjb3UwM3VoZWtoazc5OXJtZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/FY8c5SKwiNf1EtZKGs/giphy.gif",
      text: "Errr... I'll get right on it!",
    },
    {
      image:
        "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3U5ajZhamZmZ3dtNjBuMGo0bzhuOXRzMnhiazhsNzlxd2pnaG9xayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/w89ak63KNl0nJl80ig/giphy.gif",
      text: "Nothing to see here. Move along.",
    },
  ];
  const [randomItem, setRandomItem] = useState(
    randomList[Math.floor(Math.random() * randomList.length)]
  );

  function handleRandomize() {
    setRandomItem(randomList[Math.floor(Math.random() * randomList.length)]);
  }
  return (
    <div style={{ display: "block", margin: "auto" }}>
      <img
        src={randomItem.image}
        width="15%"
        height="15%"
        alt="baby running in the corridoor"
        fetchpriority="high"
        style={{ display: "block", margin: "auto" }}
      ></img>
      <h2 align="center">{randomItem.text}</h2>
    </div>
  );
}
