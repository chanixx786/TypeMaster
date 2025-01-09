import React from "react";
import GameField from "../components/GameField";

const TypingGame = () => {
  return (
    <div className="h-screen w-full bg-white items-center justify-center flex overflow-hidden">
          <div className="max-h-full max-w-full overflow-hidden">
            <GameField />
          </div>
    </div>
  );
};

export default TypingGame;