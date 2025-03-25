// ResultsScreen.jsx
import React from 'react';
import { Card, CardBody, CardTitle, CardText, Badge, Row, Col } from 'reactstrap';

const ResultsScreen = ({
  winner,
  winnerScore,
  isPlayer1Winner,
  finalPlayerData,
  playerOneScore,
  playerTwoScore
}) => {
  // A little helper to highlight the winner column
  const highlightWinnerCol = (isWinner) => (isWinner ? 'border-warning text-warning' : 'border-light text-white');

  return (
    <div className="results-screen animate__animated animate__slideInRight d-flex flex-column align-items-center">
      {/* Header: WINNER or DRAW */}
      <h3
        className="display-3 fw-bold mb-3"
        style={{
          color: winner ? '#ffd700' : '#00f',
          textShadow: 'rgb(165 151 78) 0px 0px 20px, rgb(255, 215, 0) 0px 0px 30px',
          fontFamily: '"Orbitron", sans-serif'
        }}
      >
        {winner ? 'WINNER!' : 'DRAW!'}
      </h3>

      {/* Main Results Card */}
      <Card
        className="border-0 text-white shadow mb-3 animate__animated animate__zoomIn"
        style={{
          maxWidth: '800px',
          width: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.23)', 
          backdropFilter: 'blur(6px)',
          borderRadius: '20px'
        }}
      >
        <CardBody className="p-4">
          {/* If we have a winner, show a concise winner section */}
          {winner && (
            <div className="text-center mb-5">
              <img
                src={winner.avatar}
                alt={winner.name}
                className="rounded-circle border border-3 border-warning mb-3"
                style={{ width: '130px', height: '130px', objectFit: 'cover' }}
              />
              <h2 className="text-warning mb-1" style={{ fontSize: '2rem' }}>
                {winner.name}
              </h2>
              <div
                className="bg-warning bg-opacity-25 rounded p-3 mb-3 mx-auto"
                style={{ maxWidth: '240px' }}
              >
                <h1 className="text-warning fw-bold mb-0" style={{ fontSize: '3rem' }}>
                  {winnerScore}
                </h1>
                <div className="text-white" style={{ fontSize: '0.9rem' }}>FINAL SCORE</div>
              </div>
              <h5 className="mb-2" style={{ fontWeight: '500' }}>Top Strength Hits:</h5>
              {winner.hits.map((hit, index) => (
                <Badge key={index} color="warning" className="mx-1 mb-2 p-2">
                  {hit} lbs
                </Badge>
              ))}
            </div>
          )}

          {/* Final Results Title */}
          <h3 className="text-white mb-3 text-center" style={{ fontWeight: '600' }}>
            FINAL RESULTS
          </h3>

          {/* Final Results for Both Players */}
          <Row>
            {/* Player One */}
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <div
                className={`rounded p-3 h-100 d-flex flex-column align-items-center justify-content-center ${
                  isPlayer1Winner ? 'bg-primary bg-opacity-25' : 'bg-secondary bg-opacity-10'
                }`}
              >
                <div className="d-flex align-items-center mb-2">
                  <img
                    src={finalPlayerData.playerOne.avatar}
                    alt={finalPlayerData.playerOne.name}
                    className={`rounded-circle border border-3 me-3 ${highlightWinnerCol(isPlayer1Winner)}`}
                    style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                  />
                  <CardTitle tag="h4" className="mb-0">
                    {finalPlayerData.playerOne.name}
                    {isPlayer1Winner && <span className="ms-2 text-warning">💪</span>}
                  </CardTitle>
                </div>
                <h3 className={`${isPlayer1Winner ? 'text-warning' : 'text-white'} fw-bold mb-2`}>
                  {playerOneScore} pts
                </h3>
                <CardText className="text-white">
                  <small>
                    Top Hit:{' '}
                    {finalPlayerData.playerOne.hits.length > 0
                      ? Math.max(...finalPlayerData.playerOne.hits.map(hit => parseInt(hit))) + ' lbs'
                      : 'No hits recorded'}
                  </small>
                </CardText>
              </div>
            </Col>

            {/* Player Two */}
            <Col xs={12} md={6}>
              {/* If Player One is not winner and scores differ, highlight Player Two */}
              {(() => {
                const isP2Winner = !isPlayer1Winner && playerOneScore !== playerTwoScore;
                return (
                  <div
                    className={`rounded p-3 h-100 d-flex flex-column align-items-center justify-content-center ${
                      isP2Winner ? 'bg-danger bg-opacity-25' : 'bg-secondary bg-opacity-10'
                    }`}
                  >
                    <div className="d-flex align-items-center mb-2">
                      <img
                        src={finalPlayerData.playerTwo.avatar}
                        alt={finalPlayerData.playerTwo.name}
                        className={`rounded-circle border border-3 me-3 ${highlightWinnerCol(isP2Winner)}`}
                        style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                      />
                      <CardTitle tag="h4" className="mb-0">
                        {finalPlayerData.playerTwo.name}
                        {isP2Winner && <span className="ms-2 text-warning">💪</span>}
                      </CardTitle>
                    </div>
                    <h3
                      className={`${
                        isP2Winner ? 'text-warning' : 'text-white'
                      } fw-bold mb-2`}
                    >
                      {playerTwoScore} pts
                    </h3>
                    <CardText className="text-white">
                      <small>
                        Top Hit:{' '}
                        {finalPlayerData.playerTwo.hits.length > 0
                          ? Math.max(...finalPlayerData.playerTwo.hits.map(hit => parseInt(hit))) + ' lbs'
                          : 'No hits recorded'}
                      </small>
                    </CardText>
                  </div>
                );
              })()}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default ResultsScreen;
