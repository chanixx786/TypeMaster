import React, { useEffect, useState } from "react";
import Result from "./modals/Result";

const TextDisplay = ({ timeRemaining }) => {
  const [userInput, setUserInput] = useState("");
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalWords, setTotalWords] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const textSamples = [
    `The human genome contains approximately 3 billion base pairs of DNA, which encode around 20,000 to 25,000 genes. These genes control everything from our physical appearance to our susceptibility to certain diseases. Quantum mechanics describes the behavior of matter and energy at the molecular, atomic, nuclear, and even smaller microscopic levels. The field challenges our intuitions about how the world works.", Photosynthesis is the process by which plants convert light energy into chemical energy. This process provides the oxygen and food that sustain most life on Earth.`,
    
    `Artificial Intelligence systems use machine learning algorithms to analyze vast amounts of data and identify patterns. This technology is revolutionizing fields from healthcare to transportation. The Internet operates through a vast network of interconnected computers, using protocols like TCP/IP to ensure data reaches its intended destination accurately and securely. Blockchain technology creates a decentralized, immutable record of transactions. Each block contains a cryptographic hash of the previous block, forming a chain of information.`,
    
    `The Renaissance period, spanning the 14th to 17th centuries, marked a cultural rebirth in Europe. It led to significant advances in art, architecture, politics, science, and literature. The Industrial Revolution transformed manufacturing processes, leading to unprecedented economic growth. It began in Britain in the late 18th century and spread globally. The Apollo 11 mission in 1969 successfully landed humans on the Moon. This achievement represented a major milestone in space exploration and human technological capability.`,
    
    `Cells are the fundamental units of life, containing organelles that perform specific functions. The cell membrane regulates what enters and exits the cell, maintaining homeostasis. The human nervous system consists of the brain, spinal cord, and a vast network of nerves. It processes sensory information and controls body functions. DNA replication is a complex process that ensures genetic information is accurately copied before cell division. This process is essential for inheritance and evolution.`,
    
    `Climate change affects global weather patterns, ocean levels, and ecosystems. The increase in greenhouse gases has led to rising global temperatures and more extreme weather events. Biodiversity is crucial for ecosystem stability. Each species plays a unique role in its environment, and the loss of species can have cascading effects throughout food webs. Renewable energy sources like solar, wind, and hydroelectric power offer sustainable alternatives to fossil fuels. These technologies continue to become more efficient and affordable.`,
  ];

  const [targetText, setTargetText] = useState("");
  
  useEffect(() => {
    setTargetText(textSamples[Math.floor(Math.random() * textSamples.length)]);
  }, []);

  useEffect(() => {
    if (timeRemaining === 0) {
      setShowResult(true);
    }
  }, [timeRemaining]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!startTime && e.key.length === 1) {
        setStartTime(Date.now());
      }

      if (e.key === "Backspace") {
        setUserInput((prev) => {
          const newInput = prev.slice(0, -1);
          updateMetrics(newInput);
          return newInput;
        });
      } else if (e.key.length === 1 && userInput.length < targetText.length) {
        setUserInput((prev) => {
          const newInput = prev + e.key;
          if (e.key !== targetText[prev.length]) {
            setMistakes((m) => m + 1);
          }
          updateMetrics(newInput);
          return newInput;
        });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [startTime, targetText, userInput.length]);

const updateMetrics = (currentInput) => {
    if (!startTime) return;

    // Count correct characters for score
    let currentScore = 0;
    for (let i = 0; i < currentInput.length; i++) {
        if (currentInput[i] === targetText[i]) {
            currentScore++;
        }
    }
    setScore(currentScore);

    // Calculate WPM using the provided formula
    const wpmValue = (
        currentScore / 
        5 / 
        (Math.max(1, Date.now() - startTime) / 60000)
    ).toFixed(1);

    // Calculate accuracy using the provided formula
    const accuracyValue = ((currentScore / (currentScore + mistakes)) * 100 || 0).toFixed(1);

    setWpm(Number(wpmValue));
    setAccuracy(Number(accuracyValue));
    setTotalWords(Math.round(currentScore / 5));
};

  const calculateTransform = () => {
    const lineHeight = 32;
    const charsPerLine = 70;
    const completedLines = Math.floor(userInput.length / charsPerLine);
    return Math.max(0, completedLines * lineHeight);
  };

  const renderText = () => {
    return targetText.split("").map((char, index) => {
      let bgColor = "bg-transparent";
      let textColor = "text-gray-500";
      
      if (index < userInput.length) {
        if (userInput[index] === char) {
          bgColor = "bg-green-200";
          textColor = "text-green-800";
        } else {
          bgColor = "bg-red-200";
          textColor = "text-red-800";
        }
      }
      
      return (
        <span
          key={index}
          className={`${bgColor} ${textColor} px-[1px]`}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col items-center w-full p-8">
      <div className="w-full max-w-4xl mx-auto rounded-xl shadow-lg overflow-hidden ">
        <div
          className="relative h-[300px] p-6 border-2 text-white rounded-lg shadow-sm font-mono text-xl leading-relaxed overflow-hidden bg-[#ffffff]"
          tabIndex={0}
          onFocus={(e) => e.target.classList.add('ring-2', 'ring-blue-400')}
          onBlur={(e) => e.target.classList.remove('ring-2', 'ring-blue-400')}
        >
          <div
            className="break-words whitespace-pre-wrap transition-transform duration-200 text-justify"
            style={{ transform: `translateY(-${calculateTransform()}px)` }}
          >
            {renderText()}
          </div>
        </div>
      </div>

      {!userInput && (
        <div className="mt-4 text-center text-gray-600">
          Start typing to begin the test
        </div>
      )}

      {showResult && (
        <Result
          isOpen={showResult}
          onClose={() => setShowResult(false)}
          finalSpeed={wpm}
          accuracy={accuracy}
          totalWords={totalWords}
        />
      )}
    </div>
  );
};

export default TextDisplay;