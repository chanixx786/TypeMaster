import React from "react";
import { Brain, Trophy, Target, TrendingUp, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Result = ({ isOpen, onClose, finalSpeed, insights, accuracy, totalWords, mistakes }) => {
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
    // Get the duration from the URL if available, default to 1
    const duration = window.location.pathname.split('/').pop() || "1";
    
    // Create result object
    const result = {
      date: new Date().toISOString().split('T')[0],
      duration: parseInt(duration),
      wpm: finalSpeed,
      accuracy: accuracy,
      totalWords: totalWords,
      mistakes: mistakes
    };

    // Get the appropriate storage key based on duration
    const storageKey = `${duration}MinuteResults`;
    
    // Get existing results
    const existingResults = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    
    // Add new result
    existingResults.push(result);
    
    // Save back to sessionStorage
    sessionStorage.setItem(storageKey, JSON.stringify(existingResults));

    // Navigate to dashboard
    navigate('/');
  };

  const grade = getGrade(finalSpeed, accuracy);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-white-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold mb-2">Test Complete!</h2>
          <p className="text-blue-100">Here's your detailed performance analysis</p>
        </div>

        {/* Grade Display */}
        <div className="flex justify-center -mt-8">
          <div className="bg-white rounded-full w-16 h-16 border-4 border-blue-500 flex items-center justify-center">
            <span className="text-3xl font-bold text-blue-600">{grade}</span>
          </div>
        </div>

        <div className="p-6">
          {/* Performance Overview */}
          <div className="text-center mb-6">
            <p className="text-xl font-semibold text-gray-800">
              {getPerformanceText(grade)}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-700">Speed</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{finalSpeed} WPM</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-gray-700">Accuracy</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
            </div>
          </div>

          {/* Rules based System output */}
          <div className="bg-purple-50 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Brain className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-purple-700">AI Analysis</h3>
            </div>
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start space-x-2 text-purple-600">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional Stats */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-gray-500">Total Words</p>
                <p className="text-xl font-semibold text-gray-800">{totalWords}</p>
              </div>
              <div>
                <p className="text-gray-500">Mistakes</p>
                <p className="text-xl font-semibold text-gray-800">{mistakes}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4">
          <button
            onClick={onClose}
            className="w-1/2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={saveResults}
            className="w-1/2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Save & Continue
          </button>
        </div>

        </div>
      </div>
    </div>
  );
};

export default Result;