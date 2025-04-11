// GameScreen.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import "./style.css"
import { MainHeading, TimeRemaining, SubHeading } from '../Constant/Constant';
const GameScreen = ({
  timeLeft,
  players,
  playerOneScore,
  playerTwoScore,
  getPlayerText,
  gameState
}) => {
  const [countdown, setCountdown] = useState(timeLeft);
  useEffect(() => {
    if (countdown <= 0) return; // exit if countdown is 0 or negative

    const interval = setInterval(() => {
      setCountdown((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval); // stop countdown when 0 is reached
          console.log('Countdown finished!');
          return 0;
        }
        return prevTime - 1; // decrease by 1 each second
      });
    }, 1000); // Run every second

    return () => clearInterval(interval); // cleanup interval on component unmount
  }, [countdown]);
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };


  return (
    <div className="game-screen animate__animated animate__fadeIn w-100">
      <Row className="mb-4">
        <Col>
          <h1
            className="display-2 text-white fw-bold pulsating-light "
            style={{
              textShadow: '0 0 20px #00f, 0 0 30px #00f',
              fontFamily: '"Orbitron", sans-serif'
            }}
          >
            {MainHeading}
          </h1>
          <h3 className="text-white mb-4 font-blackletter pulsating-light">{SubHeading}</h3>
        </Col>
      </Row>

      <Row className="mb-4 w-100">
        <Col xs={12} md={8} className="mx-auto">
          <div>
            <h4 className="text-white mb-1">{TimeRemaining}</h4>
            <h3 className="display-4 text-white fw-bold mb-0 pulsating-light">
              {formatTime(countdown)}
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
                      style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                    />
                  </div>
                  <h2 className="text-white mb-2">{players.playerOne.name}</h2>
                  <div className="bg-primary bg-opacity-25 rounded p-3 mb-2 w-75">
                    <h2 className="text-info fw-bold mb-0" style={{ fontSize: '4rem' }}>
                      {playerOneScore}
                    </h2>
                    <div className="text-white" style={{ fontSize: '1.5rem' }}>SCORE</div>
                  </div>

                  {getPlayerText(gameState.p1_text) && (
                    <div className="mt-2 text-info fw-bold hit-message">
                      <h3 className='font-blackletter'>"{getPlayerText(gameState.p1_text)}"</h3>
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
                      alt="Player 1"
                      className="rounded-circle border border-primary border-3"
                      style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                    />
                  </div>

                  <h2 className="text-white mb-2">{players.playerTwo.name}</h2>
                  <div className="bg-primary bg-opacity-25 rounded p-3 mb-2 w-75">
                    <h2 className="text-info fw-bold mb-0" style={{ fontSize: '4rem' }}>
                      {playerTwoScore}
                    </h2>
                    <div className="text-white" style={{ fontSize: '1.5rem' }}>SCORE</div>
                  </div>
                  {getPlayerText(gameState.p2_text) && (
                    <div className="mt-2 text-info fw-bold hit-message">
                      <h3 className='font-blackletter'>"{getPlayerText(gameState.p2_text)}"</h3>
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
