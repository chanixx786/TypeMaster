import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Timer, AlertCircle } from "lucide-react";
import TextDisplay from "../components/TextDisplay";

const TimeCategory = () => {
  
  const { minutes } = useParams();
  const [timeRemaining, setTimeRemaining] = useState(Number(minutes) * 60);

  useEffect(() => {
    if (timeRemaining === 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeRemaining / (Number(minutes) * 60)) * 100;

  return (
    <div className="min-h-screen bg-gray-700/30 p-8 rounded-lg">
      <div className="max-w-md mx-auto rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          {/* Timer Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Timer className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-white">
                {minutes} {Number(minutes) === 1 ? "minute" : "minutes"}
              </h2>
            </div>
            {timeRemaining < 60 && (
              <AlertCircle className="w-6 h-6 text-red-500 animate-pulse" />
            )}
          </div>

          {/* Timer Display */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-white mb-2">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-gray-500">Time Remaining</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <TextDisplay timeRemaining={timeRemaining} />
    </div>
  );
};

export default TimeCategory;