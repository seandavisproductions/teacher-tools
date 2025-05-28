import { useState } from "react";

export function UnderDevelopment() {
  const randomList = [
    {
      image: `${process.env.PUBLIC_URL}/babyrunning.gif`,
      text: "Whoops! Hold tight. I'm currently coding. I'll be right back.",
    },
    {
      image: `${process.env.PUBLIC_URL}/giphy (1).gif`,
      text: "Errr... I'll get right on it!",
    },
    {
      image: `${process.env.PUBLIC_URL}/giphy (2).gif`,
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
        fetchPriority="high"
        style={{ display: "block", margin: "auto" }}
      ></img>
      <h2 align="center">{randomItem.text}</h2>
    </div>
  );
}
