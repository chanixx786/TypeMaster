import React, { useEffect, useState } from 'react';

function GameField() {
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (!isStarted) return;

    // Helper function to dynamically load a script
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        script.id = `script-${src.replace(/[^a-zA-Z0-9]/g, '-')}`; // Set a unique id to identify the script
        document.body.appendChild(script);
      });
    };

    // Load all required scripts
    const loadScripts = async () => {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/tone/13.0.1/Tone.min.js");
        await loadScript("/assets/dictionary.js");
        await loadScript("/assets/util.js");
        await loadScript("/assets/stereotype.js");
        console.log("All scripts loaded successfully");
      } catch (error) {
        console.error("Error loading script:", error);
      }
    };

    loadScripts();

    return () => {
      // Cleanup logic to stop music and reset game
      if (window.Tone) {
        window.Tone.Transport.stop();
        setIsStarted(false);
      }
      const canvas = document.getElementById('gameCanvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      // Remove previously loaded scripts
      const scripts = [
        "https://cdnjs.cloudflare.com/ajax/libs/tone/13.0.1/Tone.min.js",
        "/assets/dictionary.js",
        "/assets/util.js",
        "/assets/stereotype.js"
      ];
      scripts.forEach(src => {
        const script = document.getElementById(`script--${src.replace(/[^a-zA-Z0-9]/g, '-')}`);
        if (script) {
          document.body.removeChild(script);
        }
      });
    };
  }, [isStarted]);

  const handleStart = () => {
    setIsStarted(true);
  };

  return (
    <div>
      {!isStarted && <button onClick={handleStart} className='p-2 border-2 bg-[#4ade80] text-gray-100 font-bold'>Start Game</button>}
      {isStarted && (
        <div>
          {/* Your game canvas and other components */}
          <canvas id="gameCanvas"></canvas>
        </div>
      )}
    </div>
  );
}

export default GameField;