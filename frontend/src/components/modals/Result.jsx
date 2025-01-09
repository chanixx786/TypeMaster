import React from "react";
import { Brain, Trophy, Target, TrendingUp, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Result = ({ isOpen, onClose, finalSpeed, accuracy, totalWords }) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const getGrade = (wpm, accuracy) => {
    if (wpm > 80 && accuracy > 95) return 'S';
    if (wpm > 70 && accuracy > 90) return 'A';
    if (wpm > 60 && accuracy > 85) return 'B';
    if (wpm > 50 && accuracy > 80) return 'C';
    return 'D';
  };

  const getPerformanceText = (grade) => {
    switch (grade) {
      case 'S': return 'Outstanding!';
      case 'A': return 'Excellent!';
      case 'B': return 'Good job!';
      case 'C': return 'Keep practicing!';
      default: return 'You can do better!';
    }
  };

  const saveResults = () => {
    const duration = window.location.pathname.split('/').pop() || "1";
    const result = {
      date: new Date().toISOString().split('T')[0],
      duration: parseInt(duration),
      wpm: finalSpeed,
      accuracy: accuracy,
      totalWords: totalWords
    };
    
    const storageKey = `${duration}MinuteResults`;
    const existingResults = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    existingResults.push(result);
    sessionStorage.setItem(storageKey, JSON.stringify(existingResults));
    navigate('/');
  };

  const grade = getGrade(finalSpeed, accuracy);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md relative">
        {/* Header */}
        <div className="relative bg-blue-600 p-6 rounded-t-lg">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white">Test Results</h2>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Grade */}
          <div className="flex justify-center mb-6">
            <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center border-4 border-blue-500">
              <span className="text-4xl font-bold text-blue-600">{grade}</span>
            </div>
          </div>

          {/* Performance Text */}
          <div className="text-center mb-6">
            <p className="text-lg font-medium text-gray-900">
              {getPerformanceText(grade)}
            </p>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            {/* Speed */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-700">Speed</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{finalSpeed} WPM</span>
              </div>
            </div>

            {/* Accuracy */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-700">Accuracy</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{accuracy}%</span>
              </div>
            </div>

            {/* Total Words */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium text-gray-700">Total Words</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{totalWords}</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={saveResults}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Save Result
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;