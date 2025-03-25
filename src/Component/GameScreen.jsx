// GameScreen.jsx
import React from 'react';
import { Row, Col } from 'reactstrap';
import "./style.css"
import { MainHeading,TimeRemaining,SubHeading } from '../Constant/Constant';
const GameScreen = ({
  formatTime,
  timeLeft,
  players,
  playerOneScore,
  playerTwoScore,
  getPlayerText,
  gameState
}) => {
  return (
    <div className="game-screen animate__animated animate__fadeIn w-100">
      <Row className="mb-4">
        <Col>
          <h1
            className="display-2 text-white fw-bold pulsating-light"
            style={{
              textShadow: '0 0 20px #00f, 0 0 30px #00f',
              fontFamily: '"Orbitron", sans-serif'
            }}
          >
            {MainHeading}
          </h1>
          <h4 className="text-white mb-4">{SubHeading}</h4>
        </Col>
      </Row>

      <Row className="mb-4 w-100">
        <Col xs={12} md={8} className="mx-auto">
          <div>
            <h2 className="text-white mb-1">{TimeRemaining}</h2>
            <h3 className="display-4 text-white fw-bold mb-0">
              {formatTime(timeLeft)}
            </h3>
          </div>
        </Col>
      </Row>

      <Row className="w-100">
        <Col xs={12}>
          <div className="rounded p-3 shadow" style={{ backgroundColor: 'rgba(0, 0, 0, 0.23)' }}>
            <Row className="justify-content-around">
              <Col xs={12} md={5} className="text-center mb-4 mb-md-0">
                <div className="d-flex flex-column align-items-center">
                  <div className="mb-2">
                    <img
                      src={players.playerOne.avatar}
                      alt="Player 1"
                      className="rounded-circle border border-primary border-3"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                  </div>
                  <h3 className="text-white mb-2">{players.playerOne.name}</h3>
                  <div className="bg-primary bg-opacity-25 rounded p-3 mb-2 w-75">
                    <h2 className="text-info fw-bold mb-0" style={{ fontSize: '2.5rem' }}>
                      {playerOneScore}
                    </h2>
                    <div className="text-white">SCORE</div>
                  </div>
                
                  {getPlayerText(gameState.p1_text) && (
                    <div className="mt-2 text-info fw-bold hit-message">
                      <h4>"{getPlayerText(gameState.p1_text)}"</h4>
                    </div>
                  )}
                </div>
              </Col>

              <Col xs={12} md={2} className="d-flex justify-content-center align-items-center">
                <div
                  className="h-75 d-none d-md-block"
                  style={{
                    width: '4px',
                    background: 'linear-gradient(to bottom, transparent, #00f, transparent)'
                  }}
                ></div>
                <h2 className="d-md-none my-3 text-center text-white">VS</h2>
              </Col>

              <Col xs={12} md={5} className="text-center">
                <div className="d-flex flex-column align-items-center">
                  <div className="mb-2">
                    <img
                      src={players.playerTwo.avatar}
                      alt="Player 2"
                      className="rounded-circle border border-danger border-3"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                  </div>
                  <h3 className="text-white mb-2">{players.playerTwo.name}</h3>
                  <div className="bg-danger bg-opacity-25 rounded p-3 mb-2 w-75">
                    <h2 className="text-danger fw-bold mb-0" style={{ fontSize: '2.5rem' }}>
                      {playerTwoScore}
                    </h2>
                    <div className="text-white">SCORE</div>
                  </div>
                  {getPlayerText(gameState.p2_text) && (
                    <div className="mt-2 text-danger fs-15 fw-bold hit-message">
                      <h4>"{getPlayerText(gameState.p2_text)}"</h4>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default GameScreen;
