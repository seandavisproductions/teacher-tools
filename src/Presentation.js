import { useState } from "react";

export function Presentation() {
  const [embedLink, setEmbedLink] = useState(""); 

  function handleSubmit() {
    const input = document.getElementById("embed-link").value.trim();
  
    // Validate if the input is a valid Google Slides URL
    if (input.startsWith("https://docs.google.com/presentation/d/")) {
      const embedUrl = input.replace(
        /\/edit.*$/,
        "/embed?start=false&loop=false&delayms=3000"
      );
      setEmbedLink(embedUrl);
    } else {
      alert("Please enter a valid Google Slides URL.");
    }
  }

  function handleFullscreen() {
    const iframe = document.getElementById("presentation-iframe");
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe.mozRequestFullScreen) {
      iframe.mozRequestFullScreen(); // Firefox
    } else if (iframe.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen(); // Chrome, Safari, Opera
    } else if (iframe.msRequestFullscreen) {
      iframe.msRequestFullscreen(); // IE/Edge
    }
  }

  return (
    <div className="presentation-container">
      <h3>Enter Google Slides Embed Link</h3>
      <input
        id="embed-link"
        className="input-box"
        type="text"
        placeholder="Paste your Google Slides URL here"
        style={{ width: "80%", marginBottom: "10px" }} />
      <button className="button" onClick={handleSubmit}>
        Submit
      </button>
      {embedLink && (
        <div style={{ position: "relative", marginTop: "20px" }}>
          <iframe
            id="presentation-iframe"
            src={embedLink}
            frameBorder="0"
            width="960"
            height="569"
            allowFullScreen
            title="Google Slides Presentation"
          ></iframe>
          <button
            className="button"
            onClick={handleFullscreen}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 10,
            }}
          >
            Fullscreen
          </button>
        </div>
      )}
    </div>
  );
}
