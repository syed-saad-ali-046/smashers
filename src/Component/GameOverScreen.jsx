import React from 'react';
import './style.css';

const GameOverScreen = ({ players, playerOneScore, playerTwoScore }) => {
  return (
    <div className="game-over-screen animate__animated animate__fadeIn">
      <h1 className="display-1 text-white fw-bold mb-4 pulsating">
        TIME'S UP!
      </h1>
      <div className="text-white mb-5">
        <h3>Final Scores:</h3>
        <div className="d-flex justify-content-center mt-4">
          <div className="mx-4 text-center">
            <h4 className="text-white fw-bold pulsating-light">{players.playerOne.name}</h4>
            <h2 className="display-4 text-white fw-bold">{playerOneScore}</h2>
          </div>
          <div className="mx-4 text-center">
            <h4 className="text-white fw-bold pulsating-light">{players.playerTwo.name}</h4>
            <h2 className="display-4 text-white fw-bold">{playerTwoScore}</h2>
          </div>
        </div>
      </div>
      <div className="countdown-container mt-4">
        <div className="text-white mb-2">Results will be displayed soon...</div>
        <div className="countdown-loader loading-indicator"></div>
      </div>
    </div>
  );
};

export default GameOverScreen;
