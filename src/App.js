import { useState } from "react";
import "./App.css";
import "./index.css";

const module = [
  { title: "Exercise Instructions" },
  {
    title: "Countdown Timer",
  },

  { title: "Translation" },
  { title: "Exit Ticket" },
];

export default function App() {
  const [button, setButton] = useState(false);
  return (
    <div className="">
      <Header />
      <Buttons buttons={module} />
      <Footer />
    </div>
  );
}

function Header() {
  const [objective, setObjective] = useState("");
  return (
    <div className="header">
      <h1>Teacher Toolkit</h1>
      <h3>Click on the module you need below</h3>
      <span className="">
        Todays Objective:
        <input
          className="input-text"
          type="text"
          placeholder="e.g To understand how variables work in programming"
          onChange={(e) => setObjective(e.target.value)}
        ></input>
      </span>
    </div>
  );
}

function body() {
  return;
  <ExerciseInstructions />;
}

function Buttons({ buttons }) {
  return (
    <div className="nav-container">
      {buttons.map((el, i) => (
        <Button title={el.title} key={i}></Button>
      ))}
    </div>
  );
}

function ExerciseInstructions() {
  const [instructions, setInstructions] = useState("");

  return (
    <div>
      <p>What would you like your first exercise to be?</p>
      <input type="text"></input>
      <button>add another exercise here</button>
      <button>Show in order</button>;
    </div>
  );
}

function CountdownTimer() {}

function Translation() {}

function ExitTicket() {}

function Button({ title }) {
  return (
    <div>
      <button className="teacher-button">{title}</button>
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
