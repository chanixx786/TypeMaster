import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useNavigate } from "react-router-dom";

const TestDashboard = () => {
  const [results, setResults] = useState({
    oneMinute: [],
    threeMinutes: [],
    fiveMinutes: []
  });
  const [selectedDuration, setSelectedDuration] = useState("oneMinute");

  useEffect(() => {
    const oneMinute = JSON.parse(sessionStorage.getItem('1MinuteResults') || '[]');
    const threeMinutes = JSON.parse(sessionStorage.getItem('3MinuteResults') || '[]');
    const fiveMinutes = JSON.parse(sessionStorage.getItem('5MinuteResults') || '[]');

    setResults({
      oneMinute,
      threeMinutes,
      fiveMinutes
    });
  }, []);

  const getStats = () => {
    const allResults = [
      ...results.oneMinute,
      ...results.threeMinutes,
      ...results.fiveMinutes
    ];

    if (allResults.length === 0) {
      return {
        avgWpm: 0,
        avgAccuracy: 0,
        totalTests: 0,
        recentResults: [],
      };
    }

    const avgWpm = Math.round(
      allResults.reduce((sum, result) => sum + result.wpm, 0) / allResults.length
    );

    const avgAccuracy = Math.round(
      allResults.reduce((sum, result) => sum + result.accuracy, 0) / allResults.length
    );

    const sortedResults = [...allResults].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    return {
      avgWpm,
      avgAccuracy,
      totalTests: allResults.length,
      recentResults: sortedResults.slice(0, 5),
    };
  };

  const getChartData = (duration) => {
    let data = [];
    switch(duration) {
      case "oneMinute":
        data = results.oneMinute;
        break;
      case "threeMinutes":
        data = results.threeMinutes;
        break;
      case "fiveMinutes":
        data = results.fiveMinutes;
        break;
      default:
        data = results.oneMinute;
    }
    return [...data].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7);
  };

  const stats = getStats();

  const getDurationLabel = (duration) => {
    switch(duration) {
      case "oneMinute":
        return "1 Minute Test";
      case "threeMinutes":
        return "3 Minutes Test";
      case "fiveMinutes":
        return "5 Minutes Test";
      default:
        return "";
    }
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6">
      <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-3 bg-gray-700/30 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Typing Test</h2>
          <p className="text-white/75 mb-6">Choose your test duration</p>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate("/TimeCategory/1")}
              className="w-full py-3 text-white rounded-lg font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm"
            >
              1 Minute Challenge
            </button>
            <button
              onClick={() => navigate("/TimeCategory/3")}
              className="w-full py-3 text-white rounded-lg font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
            >
              3 Minutes Practice
            </button>
            <button
              onClick={() => navigate("/TimeCategory/5")}
              className="w-full py-3 text-white rounded-lg font-medium bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
            >
              5 Minutes Pro
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-2">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.avgWpm}</p>
                <p className="text-xs text-blue-400">Avg. WPM</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.avgAccuracy}%</p>
                <p className="text-xs text-green-400">Accuracy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12 md:col-span-9 space-y-6">
          {/* Performance Chart */}
          <div className="bg-gray-700/30 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                Performance Overview - {getDurationLabel(selectedDuration)}
              </h2>
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedDuration === "oneMinute"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedDuration("oneMinute")}
                >
                  1 Min
                </button>
                <button
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedDuration === "threeMinutes"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedDuration("threeMinutes")}
                >
                  3 Min
                </button>
                <button
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedDuration === "fiveMinutes"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedDuration("fiveMinutes")}
                >
                  5 Min
                </button>
              </div>
            </div>
            <div className="w-full h-[300px]">
              <LineChart width={800} height={300} data={getChartData(selectedDuration)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="wpm" stroke="#2563eb" name="WPM" />
                <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#10b981" name="Accuracy %" />
              </LineChart>
            </div>
          </div>

          {/* Recent Tests Table */}
          <div className="bg-gray-700/30 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Tests</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/90 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/90 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/90 uppercase tracking-wider">
                      WPM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/90 uppercase tracking-wider">
                      Accuracy
                    </th>
                  </tr>
                </thead>
                <tbody className=" divide-y divide-gray-200">
                  {stats.recentResults.map((result, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                        {result.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm  text-white/80">
                        {result.duration} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm  text-white/80">
                        {result.wpm}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm  text-white/80">
                        {result.accuracy}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;