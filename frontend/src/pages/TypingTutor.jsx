import React, { useState, useEffect } from "react";

// MechanicalHand Component
const MechanicalHand = ({ side, activeFingers, letters }) => {
  const fingerPositions = {
    pinky:
      side === "left"
        ? "M 20,280 Q 20,200 30,120"
        : "M 280,280 Q 280,200 270,120",
    ring:
      side === "left"
        ? "M 60,290 Q 60,210 70,110"
        : "M 240,290 Q 240,210 230,110",
    middle:
      side === "left"
        ? "M 100,295 Q 100,215 110,105"
        : "M 200,295 Q 200,215 190,105",
    index:
      side === "left"
        ? "M 140,290 Q 140,210 150,115"
        : "M 160,290 Q 160,210 150,115",
    thumb:
      side === "left"
        ? "M 160,300 Q 180,270 200,240"
        : "M 140,300 Q 120,270 100,240",
  };

  const letterPositions = {
    pinky: side === "left" ? { x: 30, y: 110 } : { x: 270, y: 110 },
    ring: side === "left" ? { x: 70, y: 105 } : { x: 230, y: 105 },
    middle: side === "left" ? { x: 110, y: 100 } : { x: 190, y: 100 },
    index: side === "left" ? { x: 150, y: 105 } : { x: 150, y: 105 },
    thumb: side === "left" ? { x: 200, y: 230 } : { x: 100, y: 230 },
  };

  return (
    <svg
      width="300"
      height="400"
      viewBox="0 0 300 400"
      className="drop-shadow-xl"
    >
      <defs>
        <linearGradient
          id={`metalGradient-${side}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" style={{ stopColor: "#2D3748" }} />
          <stop offset="50%" style={{ stopColor: "#4A5568" }} />
          <stop offset="100%" style={{ stopColor: "#2D3748" }} />
        </linearGradient>
        <filter id={`glow-${side}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`activeGlow-${side}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#48BB78" }} />
          <stop offset="100%" style={{ stopColor: "#68D391" }} />
        </linearGradient>
      </defs>

      {/* Base */}
      <path
        d={`M ${side === "left" ? "20,280" : "280,280"} 
            C ${
              side === "left"
                ? "20,320 280,320 280,280"
                : "280,320 20,320 20,280"
            }`}
        fill={`url(#metalGradient-${side})`}
        stroke="#1A202C"
        strokeWidth="3"
        filter="url(#shadow)"
      />

      {Object.entries(fingerPositions).map(([finger, path]) => {
        const isActive = activeFingers.includes(finger);
        return (
          <g key={finger}>
            {/* Finger stem */}
            <path
              d={path}
              fill="none"
              stroke={isActive ? `url(#activeGlow-${side})` : "#4A5568"}
              strokeWidth={isActive ? "5" : "4"}
              strokeLinecap="round"
              filter={isActive ? `url(#glow-${side})` : ""}
              className={`transition-all duration-300 ${isActive ? "animate-pulse" : ""}`}
            />

            {/* Joints */}
            {finger !== "thumb"
              ? [0.3, 0.6, 0.9].map((t, i) => {
                  const point = path.split(" ")[1].split(",").map(Number);
                  return (
                    <circle
                      key={i}
                      cx={point[0] + t * (letterPositions[finger].x - point[0])}
                      cy={point[1] + t * (letterPositions[finger].y - point[1])}
                      r="4"
                      fill={isActive ? "#68D391" : "#4A5568"}
                      stroke="#1A202C"
                      className="transition-colors duration-300"
                    />
                  );
                })
              : [0.5].map((t, i) => {
                  const point = path.split(" ")[1].split(",").map(Number);
                  return (
                    <circle
                      key={i}
                      cx={point[0] + t * (letterPositions[finger].x - point[0])}
                      cy={point[1] + t * (letterPositions[finger].y - point[1])}
                      r="4"
                      fill={isActive ? "#68D391" : "#4A5568"}
                      stroke="#1A202C"
                      className="transition-colors duration-300"
                    />
                  );
                })}

            {/* Letters */}
            {isActive && letters[finger] && (
              <g
                transform={`translate(${letterPositions[finger].x},${
                  letterPositions[finger].y
                })`}
                className="transition-opacity duration-300"
              >
                {letters[finger].map((letter, idx) => (
                  <g key={letter} transform={`translate(0,${idx * 25})`}>
                    <circle
                      r="14"
                      fill="#68D391"
                      stroke="#2F855A"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                    <text
                      textAnchor="middle"
                      dy="5"
                      className="text-sm font-bold fill-white"
                    >
                      {letter}
                    </text>
                  </g>
                ))}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

const TypingCorrection = ({ text, reference_text, time_taken, accuracy }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const analyzeText = async () => {
        if (!text || text.trim() === "") return;

        setLoading(true);
        setError(null);

        try {
          const response = await fetch(
            "http://localhost:5000/api/analyze-text",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text,
                reference_text,
                time_taken,
                accuracy
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to analyze text, network issue.");
          }

          const data = await response.json();
          setAnalysis(data);
        } catch (err) {
          setError(err.message || "An unknown error occurred.");
          console.error("Typing analysis failed:", err);
        } finally {
          setLoading(false);
        }
      };

      analyzeText();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [text, reference_text, time_taken]);

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-medium text-gray-200">Typing Analysis</h3>

      {loading ? (
        <div className="text-blue-400 animate-pulse">
          Analyzing your typing...
        </div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : analysis ? (
        <div className="space-y-4">
          {/* Metrics Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">WPM</div>
              <div className="text-blue-400 text-xl font-mono">
                {analysis.metrics.wpm}
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Accuracy</div>
              <div className="text-blue-400 text-xl font-mono">
                {analysis.metrics.accuracy}%
              </div>
            </div>
          </div>

          {/* Performance Level */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-gray-400 text-sm">Performance Level</div>
            <div className="text-green-400 font-medium">
              {analysis.performance_level}
            </div>
          </div>

          {/* Error Analysis */}
          {analysis.error_analysis.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-2">Errors Found</div>
              <div className="text-red-400">
                Total Errors: {analysis.metrics.error_count}
              </div>
              <div className="mt-2 max-h-32 overflow-y-auto">
                {analysis.error_analysis.map((error, index) => (
                  <div key={index} className="text-sm text-gray-300">
                    Typed "{error.typed}" instead of "{error.expected}"
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Corrected Text */}
          {analysis.corrected_text && analysis.corrected_text !== text && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-2">
                Corrected Version
              </div>
              <div className="text-green-400 font-mono">
                {analysis.corrected_text}
              </div>
            </div>
          )}

          {/* Feedback */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-gray-400 text-sm mb-2">Feedback</div>
            <div className="text-gray-300 text-sm">{analysis.feedback}</div>
          </div>
        </div>
      ) : (
        <div className="text-gray-400">Start typing to see analysis</div>
      )}
    </div>
  );
};
// Enhanced AIInsights Component
const AIInsights = ({
  text,
  setText,
  score,
  mistakes,
  currentIndex,
  setCurrentIndex,
  setScore,
  setMistakes,
  startTime,
}) => {
  const [userTypedText, setUserTypedText] = useState("");

  // Calculate metrics
  const accuracy = ((score / (score + mistakes)) * 100 || 0).toFixed(1);
  // const progress = ((currentIndex / text.length) * 100).toFixed(1);
  // const wpm = (
  //   score /
  //   5 /
  //   (Math.max(1, Date.now() - startTime) / 60000)
  // ).toFixed(1);

  // Update userTypedText when currentIndex changes
  useEffect(() => {
    setUserTypedText(text.slice(0, currentIndex));
  }, [currentIndex, text]);

  // const getAccuracyFeedback = () => {
  //   if (accuracy >= 95) return "Excellent accuracy! Keep up the great work!";
  //   if (accuracy >= 85)
  //     return "Good accuracy. Focus on maintaining consistent finger positions.";
  //   return "Try to slow down and focus on accuracy over speed. Practice makes perfect!";
  // };

  // const getSpeedFeedback = () => {
  //   if (wpm > 60)
  //     return "Impressive typing speed! Now focus on maintaining accuracy.";
  //   if (wpm > 40)
  //     return "Good typing speed. Keep practicing to build muscle memory.";
  //   return "Focus on proper finger placement to gradually increase your speed.";
  // };

  // const resetPractice = (newText) => {
  //   setText(newText);
  //   setCurrentIndex(0);
  //   setScore(0);
  //   setMistakes(0);
  // };

  return (
    <div className="bg-gray-700/30 rounded-xl p-6 backdrop-blur-sm space-y-6">
      {/* <div className="grid grid-cols-2"> */}
        {/* Real-time Metrics */}
        {/* <div className="space-y-4"> */}
          {/* <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="text-gray-300">
              <span className="text-gray-400">Accuracy:</span>
              <span className="ml-2 font-mono text-blue-400">{accuracy}%</span>
            </div>
            <div className="mt-2 bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 rounded-full h-2 transition-all"
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div> */}
          {/*           
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="text-gray-300">
              <span className="text-gray-400">Speed:</span>
              <span className="ml-2 font-mono text-green-400">{wpm} WPM</span>
            </div>
          </div> */}

          {/* <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="text-gray-300">
              <span className="text-gray-400">Progress:</span>
              <span className="ml-2 font-mono text-purple-400">{progress}%</span>
            </div>
            <div className="mt-2 bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 rounded-full h-2 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div> */}
        {/* </div> */}

        {/* Feedback Section */}
        {/* <div className="bg-gray-800/50 p-4 rounded-lg space-y-4">
          <h3 className="text-gray-200 font-medium">Real-time Feedback</h3>
          <p className="text-sm text-gray-300">{getAccuracyFeedback()}</p>
          <p className="text-sm text-gray-300">{getSpeedFeedback()}</p>
        </div> */}
      {/* </div> */}

      {/* Practice Text Options */}
      {/* <div className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() =>
              resetPractice("The quick brown fox jumps over the lazy dog.")
            }
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
          >
            Pangram
          </button>
          <button
            onClick={() =>
              resetPractice("In an abundance of water, the fool is thirsty.")
            }
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
          >
            Proverb
          </button>
          <button
            onClick={() =>
              resetPractice("She sells seashells by the seashore.")
            }
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
          >
            Tongue Twister
          </button>
        </div>
      </div> */}

      {/* AI Analysis Section */}
      <TypingCorrection
        text={userTypedText}
        reference_text={text}
        time_taken={(Date.now() - startTime) / 1000}
        accuracy={parseFloat(accuracy)}
      />
    </div>
  );
};

// Main TypingTutor Component
const TypingTutor = () => {
  const textSamples = [
    "Photosynthesis is the process by which green plants, algae, and some bacteria convert sunlight, carbon dioxide, and water into glucose and oxygen. This process primarily occurs in chloroplasts containing the green pigment chlorophyll. Photosynthesis is essential because it forms the base of the food chain and is responsible for releasing oxygen into the atmosphere, sustaining life on Earth.",
    "The theory of relativity, developed by Albert Einstein, revolutionized our understanding of space, time, and gravity. It comprises the special and general relativity theories. Special relativity introduced the concept that the speed of light is constant and independent of the observer’s frame of reference, while general relativity describes gravity as the curvature of spacetime caused by mass and energy.",
    "Human anatomy and physiology are the sciences concerned with the structure and function of the human body. The body comprises various systems, such as the circulatory system, which transports nutrients and oxygen via blood, and the nervous system, which enables communication and response to stimuli. Each system works interdependently to maintain homeostasis and overall health.",
    "Climate change is a long-term alteration in global or regional climate patterns. It has become a pressing issue due to rising greenhouse gas emissions from human activities, such as burning fossil fuels and deforestation. Effects include increased global temperatures, melting polar ice caps, rising sea levels, and more extreme weather events. Addressing climate change requires international cooperation and the adoption of renewable energy sources.",
    "The process of evolution explains how species of organisms change over time through natural selection. Proposed by Charles Darwin, this theory states that individuals with traits better adapted to their environment are more likely to survive and reproduce. Over generations, these advantageous traits become more common, leading to the diversity of life we see today."
  ];
  

  const [text, setText] = useState(
    () => textSamples[Math.floor(Math.random() * textSamples.length)]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [lastKeyCorrect, setLastKeyCorrect] = useState(null);

  const fingerMap = {
    Q: ["left", "pinky"],
    W: ["left", "ring"],
    E: ["left", "middle"],
    R: ["left", "index"],
    T: ["left", "index"],
    Y: ["right", "index"],
    U: ["right", "index"],
    I: ["right", "middle"],
    O: ["right", "ring"],
    P: ["right", "pinky"],
    A: ["left", "pinky"],
    S: ["left", "ring"],
    D: ["left", "middle"],
    F: ["left", "index"],
    G: ["left", "index"],
    H: ["right", "index"],
    J: ["right", "index"],
    K: ["right", "middle"],
    L: ["right", "ring"],
    Z: ["left", "pinky"],
    X: ["left", "ring"],
    C: ["left", "middle"],
    V: ["left", "index"],
    B: ["left", "index"],
    N: ["right", "index"],
    M: ["right", "index"],
    " ": ["right", "thumb"],
  };

  const lettersByFinger = {
    left: {
      pinky: ["Q", "A", "Z"],
      ring: ["W", "S", "X"],
      middle: ["E", "D", "C"],
      index: ["R", "F", "V", "T", "G", "B"],
      thumb: ["_"],
    },
    right: {
      index: ["Y", "H", "N", "U", "J", "M"],
      middle: ["I", "K"],
      ring: ["O", "L"],
      pinky: ["P"],
      thumb: ["⎵"],
    },
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      const expectedChar = text[currentIndex]?.toUpperCase();
      const pressedKey = e.key.toUpperCase();

      if (expectedChar) {
        if (pressedKey === expectedChar) {
          playKeySound(true);
          setScore((prev) => prev + 1);
          setCurrentIndex((prev) => prev + 1);
          setLastKeyCorrect(true);
        } else {
          playKeySound(false);
          setMistakes((prev) => prev + 1);
          setLastKeyCorrect(false);
        }
      }
      if (currentIndex === 0) {
        setStartTime(Date.now());
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [currentIndex, text]);

  const getActiveFingers = () => {
    if (currentIndex >= text.length) return { left: [], right: [] };
    const currentChar = text[currentIndex].toUpperCase();
    if (!fingerMap[currentChar]) return { left: [], right: [] };
    const [side, finger] = fingerMap[currentChar];
    return {
      left: side === "left" ? [finger] : [],
      right: side === "right" ? [finger] : [],
    };
  };

  const activeFingers = getActiveFingers();

  const playKeySound = (correct) => {
    const audio = new Audio();
    audio.src = correct ? "/sounds/key-press.wav" : "/sounds/key-error.mp3";
    audio.play().catch((err) => console.log("Audio playback failed:", err));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-xl text-gray-300 mb-4 min-h-[2rem] leading-8 text-justify">
            {text.split("").map((char, idx) => (
              <span
                key={idx}
                className={`${
                  idx === currentIndex ? "bg-blue-500 text-white px-1 rounded" : ""
                } ${idx < currentIndex ? "text-green-400" : ""} ${
                  idx > currentIndex ? "text-gray-500" : ""
                } transition-colors duration-150`}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center items-center gap-12 bg-gray-700/50 p-8 rounded-xl backdrop-blur-sm mb-2">
          <MechanicalHand
            side="left"
            activeFingers={activeFingers.left}
            letters={lettersByFinger.left}
          />
          <div className="w-px h-32 bg-gray-600/50" />
          <MechanicalHand
            side="right"
            activeFingers={activeFingers.right}
            letters={lettersByFinger.right}
          />
        </div>

        <AIInsights
          text={text}
          setText={setText}
          score={score}
          mistakes={mistakes}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          setScore={setScore}
          setMistakes={setMistakes}
          startTime={startTime}
        />
      </div>

      <div className="text-center text-gray-500 text-sm">
        <p>Press any key to start typing • ESC to reset • Powered by AI</p>
      </div>
    </div>
  );
};

export default TypingTutor;
