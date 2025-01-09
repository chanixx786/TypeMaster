import React from "react";
import { NavLink } from "react-router-dom";
import { Keyboard, Book, Gamepad2, Crown } from "lucide-react";

const menuItems = [
  {
    title: "Typing Test",
    icon: Keyboard,
    path: "/",
  },
  {
    title: "Typing Tutor",
    icon: Book,
    path: "/tutor",
  },
  {
    title: "Typing Game",
    icon: Gamepad2,
    path: "/game",
  },
];

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 border-r-2 border-r-slate-500">
      {/* Title of the site */}
      <div className="py-8 px-6">
        <div className="flex items-center gap-3 px-2">
          <Keyboard className="w-8 h-8 text-green-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            TypeMaster
          </h1>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="px-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-green-500/20 text-green-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      {/* <div className="mt-8 px-4">
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium">Your Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Top Speed</p>
              <p className="text-lg font-bold text-green-400">75 WPM</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Accuracy</p>
              <p className="text-lg font-bold text-green-400">98%</p>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Sidebar;