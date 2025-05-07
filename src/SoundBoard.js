import { useState } from "react";
import { UnderDevelopment } from "./UnderDevelopment";

export function SoundBoard() {
  const [soundList, setSoundList] = useState([]);
  const [soundName, setSoundName] = useState("");
  return <UnderDevelopment />;
}
