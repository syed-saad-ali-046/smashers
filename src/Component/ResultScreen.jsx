import { Card, CardBody, CardTitle, Badge, Row, Col, Container } from "reactstrap"

const ResultsScreen = ({ winner, winnerScore, isPlayer1Winner, finalPlayerData, playerOneScore, playerTwoScore }) => {
  return (
    <div
      className="results-screen min-vh-100 d-flex flex-column align-items-center justify-content-center"
      style={{

        position: "relative",
        overflow: "hidden",
      }}
    >
     
      <Container className="position-relative z-1 py-2">
        {/* Winner announcement */}
        <div className="text-center mb-5 animate__animated animate__fadeInDown">
          <h1
            className="display-1 fw-bold text-warning mb-4"
            style={{
              color: "#ffd700",
              textShadow: "0 0 15px rgba(255, 215, 0, 0.7), 0 0 30px rgba(255, 215, 0, 0.5)",
              fontFamily: '"Orbitron", sans-serif',
            }}
          >
            {winner ? "WINNER!" : "DRAW!"}
          </h1>

          {winner && (
            <div className="d-flex flex-column align-items-center animate__animated animate__zoomIn">
              <div className="position-relative mb-4">
                <div
                  className="position-absolute"
                  style={{
                    inset: 0,
                    borderRadius: "50%",
                    background: "#ffd700",
                    filter: "blur(10px)",
                    opacity: 0.5,
                  }}
                ></div>
                <img
                  src={winner.avatar || "/placeholder.svg"}
                  alt={winner.name}
                  className="position-relative rounded-circle border border-4 border-warning mb-3"
                  style={{ width: "150px", height: "150px", objectFit: "cover", zIndex: 1 }}
                />
                <div
                  className="position-absolute"
                  style={{
                    inset: "-12px",
                    borderRadius: "50%",
                    border: "2px dashed #ffd700",
                    opacity: 0.7,
                    animation: "spin 20s linear infinite",
                  }}
                ></div>
              </div>

              <h2 className="text-warning fw-bold mb-3" style={{ fontSize: "2.5rem" }}>
                {winner.name}
              </h2>

              <div
                className="bg-warning bg-opacity-25 rounded-lg p-4  mx-auto"
                style={{
                  maxWidth: "240px",
                  backdropFilter: "blur(5px)",
                  border: "1px solid rgba(255, 215, 0, 0.3)",
                  borderRadius: "7px",
                }}
              >
                <div className="text-warning fw-bold mb-0" style={{maxWidth:"320px" ,fontSize: "3.5rem" ,borderRadius:"7px"}}>
                {winnerScore}
                </div>
                <div className="text-white" style={{ fontSize: "0.9rem", letterSpacing: "1px" }}>
                  FINAL SCORE
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Final results section */}
        <div className="w-100 animate__animated animate__fadeInUp">
          <div className="text-center mb-4">
            <h2
              className="d-inline-block text-white fw-bold px-5 py-2 border-bottom border-primary"
              style={{
                fontSize: "1.8rem",
                letterSpacing: "2px",
                borderBottomWidth: "2px",
              }}
            >
              FINAL RESULTS
            </h2>
          </div>

          <Row className="g-4">
            {/* Player One Card */}
            <Col xs={12} md={6}>
              <Card
                className="border-0 shadow-lg animate__animated animate__fadeInLeft"
                style={{
                  background: isPlayer1Winner ? "rgba(25, 58, 139, 0.6)" : "rgba(13, 27, 72, 0.4)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <CardBody className="position-relative p-4">
                  {isPlayer1Winner && (
                    <div className="position-absolute top-0 end-0 p-3">
                      <i className="fas fa-trophy text-warning" style={{ fontSize: "1.5rem" }}></i>
                    </div>
                  )}

                  <div className="d-flex align-items-center mb-4">
                    <div className="position-relative me-3">
                      <div
                        className="position-absolute"
                        style={{
                          inset: 0,
                          borderRadius: "50%",
                          background: isPlayer1Winner ? "#ffd700" : "#60a5fa",
                          filter: "blur(5px)",
                          opacity: 0.5,
                        }}
                      ></div>
                      <img
                        src={finalPlayerData?.playerOne?.avatar || "/placeholder.svg"}
                        alt={finalPlayerData?.playerOne?.name}
                        className="position-relative rounded-circle border-2"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderColor: isPlayer1Winner ? "#ffd700" : "#60a5fa",
                          zIndex: 1,
                        }}
                      />
                    </div>
                    <div>
                      <CardTitle tag="h3" className="text-white fw-bold mb-1">
                        {finalPlayerData?.playerOne?.name}
                      </CardTitle>
                      <div className="d-flex align-items-center">
                        <i className={`fas fa-bolt me-1 ${isPlayer1Winner ? "text-warning" : "text-primary"}`}></i>
                        <span className="text-light small">Player 1</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="text-center p-3 rounded-3 mb-3"
                    style={{
                      background: isPlayer1Winner ? "rgba(255, 215, 0, 0.1)" : "rgba(96, 165, 250, 0.1)",
                      border: `1px solid ${isPlayer1Winner ? "rgba(255, 215, 0, 0.2)" : "rgba(96, 165, 250, 0.2)"}`,
                    }}
                  >
                    <div
                      className={`fw-bold ${isPlayer1Winner ? "text-warning" : "text-white"}`}
                      style={{ fontSize: "2.5rem" }}
                    >
                      {playerOneScore} <span className="small">pts</span>
                    </div>
                  </div>

                  
                </CardBody>
              </Card>
            </Col>

            {/* Player Two Card */}
            <Col xs={12} md={6}>
              <Card
                className="border-0 shadow-lg animate__animated animate__fadeInRight"
                style={{
                  background:
                    !isPlayer1Winner && playerOneScore !== playerTwoScore
                      ? "rgba(88, 28, 135, 0.6)"
                      : "rgba(13, 27, 72, 0.4)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <CardBody className="position-relative p-4">
                  {!isPlayer1Winner && playerOneScore !== playerTwoScore && (
                    <div className="position-absolute top-0 end-0 p-3">
                      <i className="fas fa-trophy text-warning" style={{ fontSize: "1.5rem" }}></i>
                    </div>
                  )}

                  <div className="d-flex align-items-center mb-4">
                    <div className="position-relative me-3">
                      <div
                        className="position-absolute"
                        style={{
                          inset: 0,
                          borderRadius: "50%",
                          background: !isPlayer1Winner && playerOneScore !== playerTwoScore ? "#ffd700" : "#c084fc",
                          filter: "blur(5px)",
                          opacity: 0.5,
                        }}
                      ></div>
                      <img
                        src={finalPlayerData?.playerTwo?.avatar || "/placeholder.svg"}
                        alt={finalPlayerData?.playerTwo?.name}
                        className="position-relative rounded-circle border-2"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderColor: !isPlayer1Winner && playerOneScore !== playerTwoScore ? "#ffd700" : "#c084fc",
                          zIndex: 1,
                        }}
                      />
                    </div>
                    <div>
                      <CardTitle tag="h3" className="text-white fw-bold mb-1">
                        {finalPlayerData?.playerTwo?.name}
                      </CardTitle>
                      <div className="d-flex align-items-center">
                        <i
                          className={`fas fa-bolt me-1 ${!isPlayer1Winner && playerOneScore !== playerTwoScore ? "text-warning" : "text-purple"}`}
                        ></i>
                        <span className="text-light small">Player 2</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="text-center p-3 rounded-3 mb-3"
                    style={{
                      background:
                        !isPlayer1Winner && playerOneScore !== playerTwoScore
                          ? "rgba(255, 215, 0, 0.1)"
                          : "rgba(192, 132, 252, 0.1)",
                      border: `1px solid ${!isPlayer1Winner && playerOneScore !== playerTwoScore ? "rgba(255, 215, 0, 0.2)" : "rgba(192, 132, 252, 0.2)"}`,
                    }}
                  >
                    <div
                      className={`fw-bold ${!isPlayer1Winner && playerOneScore !== playerTwoScore ? "text-warning" : "text-white"}`}
                      style={{ fontSize: "2.5rem" }}
                    >
                      {playerTwoScore} <span className="small">pts</span>
                    </div>
                  </div>

                  
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>

      {/* Add Font Awesome for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      {/* Add Animate.css for animations */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />

      {/* Add custom styles */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap');
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .results-screen {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          .animate__animated.animate__fadeInDown {
            animation-duration: 1s;
          }
          
          .animate__animated.animate__fadeInUp {
            animation-duration: 1s;
            animation-delay: 0.5s;
          }
          
          .animate__animated.animate__fadeInLeft,
          .animate__animated.animate__fadeInRight {
            animation-duration: 1s;
            animation-delay: 0.7s;
          }
          
          .animate__animated.animate__zoomIn {
            animation-duration: 1s;
            animation-delay: 0.3s;
          }
        `}
      </style>
    </div>
  )
}

export default ResultsScreen

