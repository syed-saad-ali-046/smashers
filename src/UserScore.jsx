import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Progress, Card, CardBody, CardTitle, CardText, Badge } from 'reactstrap';
import Neon from "./asset/neon.mp4";
import winner_background from "./asset/winner_background.mp4";
import During_Game from "./asset/default_video.mp4";
import Waiting from './Component/waiting';
import GameScreen from './Component/GameScreen';
import GameOverScreen from './Component/GameOverScreen';
import ResultsScreen from './Component/ResultScreen';
import './Component/style.css'

// Motivation texts based on code numbers
const MOTIVATION_TEXTS = {
    '1': "You can do better!",
    '2': "Keep pushing harder!",
    '3': "That's some strength!",
    '4': "Almost there, one more!",
    '5': "Incredible power!"
};

const SmasherGameUI = () => {
    // Game state from backend
    const [gameState, setGameState] = useState({
        start_flag: false,
        stop_flag: false,
        p1_score: "0",
        p2_score: "0",
        p1_win_state: false,
        p2_win_state: false,
        p1_text: "0",
        p2_text: "0"
    });

    // UI state
    const [timeLeft, setTimeLeft] = useState(10);
    const [gameActive, setGameActive] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [currentScreen, setCurrentScreen] = useState('waiting');

    // Player data
    const [players, setPlayers] = useState({
        playerOne: {
            name: "Player 1",
            avatar: "https://static.vecteezy.com/system/resources/thumbnails/022/720/061/small/boxer-muscles-brutal-strong-fighter-ai-generated-photo.jpeg",
            hits: []
        },
        playerTwo: {
            name: "Player 2",
            avatar: "https://static.vecteezy.com/system/resources/thumbnails/022/720/061/small/boxer-muscles-brutal-strong-fighter-ai-generated-photo.jpeg",
            hits: []
        }
    });

    // Preserve final game state for results screen
    const [finalGameState, setFinalGameState] = useState(null);
    const [finalPlayerData, setFinalPlayerData] = useState(null);

    // Refs for WebSocket connection
    const socketRef = useRef(null);
    const connectingRef = useRef(false);
    const wsReconnectTimerRef = useRef(null);

    // Connect to WebSocket (ZeroMQ proxy)
    useEffect(() => {
        const setupWebSocketConnection = () => {
            if (connectingRef.current) return;
            connectingRef.current = true;

            try {
                const wsUrl = 'ws://localhost:8061';
                const socket = new WebSocket(wsUrl);

                socket.onopen = () => {
                    console.log('Connected to WebSocket proxy for ZMQ');
                    socketRef.current = socket;
                    connectingRef.current = false;

                    // Clear any reconnect timers
                    if (wsReconnectTimerRef.current) {
                        clearTimeout(wsReconnectTimerRef.current);
                        wsReconnectTimerRef.current = null;
                    }
                };

                socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('Received ZMQ data:', data);

                        // Update game state
                        setGameState(prevState => {
                            const newState = { ...prevState, ...data };

                            // Handle player hits when text codes are received
                            if (data.p1_text && data.p1_text !== "0" && data.p1_text !== prevState.p1_text) {
                                // Add a simulated hit value for player 1
                                const hitValue = `${Math.floor(Math.random() * 300) + 700}`;
                                setPlayers(prev => ({
                                    ...prev,
                                    playerOne: {
                                        ...prev.playerOne,
                                        hits: [...prev.playerOne.hits, hitValue].slice(-3) // Keep only last 3 hits
                                    }
                                }));
                            }

                            if (data.p2_text && data.p2_text !== "0" && data.p2_text !== prevState.p2_text) {
                                // Add a simulated hit value for player 2
                                const hitValue = `${Math.floor(Math.random() * 300) + 600}`;
                                setPlayers(prev => ({
                                    ...prev,
                                    playerTwo: {
                                        ...prev.playerTwo,
                                        hits: [...prev.playerTwo.hits, hitValue].slice(-3) // Keep only last 3 hits
                                    }
                                }));
                            }

                            return newState;
                        });
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    socketRef.current = null;
                    connectingRef.current = false;
                };

                socket.onclose = () => {
                    console.log('WebSocket connection closed');
                    socketRef.current = null;
                    connectingRef.current = false;

                    // Try to reconnect after a delay
                    wsReconnectTimerRef.current = setTimeout(() => {
                        console.log('Attempting to reconnect WebSocket...');
                        setupWebSocketConnection();
                    }, 3000);
                };
            } catch (error) {
                console.error('Failed to connect to WebSocket:', error);
                connectingRef.current = false;

                // Try to reconnect after a delay
                wsReconnectTimerRef.current = setTimeout(() => {
                    console.log('Attempting to reconnect WebSocket...');
                    setupWebSocketConnection();
                }, 3000);
            }
        };

        setupWebSocketConnection();

        return () => {
            // Cleanup
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }

            if (wsReconnectTimerRef.current) {
                clearTimeout(wsReconnectTimerRef.current);
                wsReconnectTimerRef.current = null;
            }

            connectingRef.current = false;
        };
    }, []);
    useEffect(() => {
        const handleGameStateChange = () => {
            // Check for game start conditions
            if (gameState.start_flag && !gameState.stop_flag && currentScreen !== 'game') {
                console.log("Game starting!");
                // Reset game state for a new game
                setCurrentScreen('game');
                setGameActive(true);
                setGameOver(false);
                setShowResults(false);
                // Use time_remaining from backend instead of hardcoding 60
                setTimeLeft(parseInt(gameState.time_remaining) || 60);
                setPlayers({
                    playerOne: {
                        ...players.playerOne,
                        hits: []
                    },
                    playerTwo: {
                        ...players.playerTwo,
                        hits: []
                    }
                });
            }

            // Update the timer whenever we receive new data from backend
            if (gameActive && gameState.time_remaining) {
                setTimeLeft(parseInt(gameState.time_remaining));
            }

            // Check for game stop conditions with a winner
            if (!gameState.start_flag && gameState.stop_flag && gameActive) {
                console.log("Game ending with winner determination!");
                // Save final game state
                setFinalGameState({ ...gameState });
                setFinalPlayerData({ ...players });

                // End the game
                setGameActive(false);
                setGameOver(true);
                setCurrentScreen('gameOver');

                // Show results after a delay for a better transition experience
                setTimeout(() => {
                    setCurrentScreen('results');
                    setShowResults(true);
                }, 8000); // 8 seconds as requested
            }

            // Check for reset to waiting screen (both flags are 0)
            if (!gameState.start_flag && !gameState.stop_flag && (currentScreen === 'results' || currentScreen === 'gameOver')) {
                console.log("Resetting to waiting screen!");
                setCurrentScreen('waiting');
                setGameActive(false);
                setGameOver(false);
                setShowResults(false);
            }
        };

        handleGameStateChange();
    }, [gameState, gameActive, players, currentScreen]);

    // Timer countdown effect
    useEffect(() => {
        if (gameActive && timeLeft === 0) {
            // Time's up - force game over
            setGameActive(false);
            setGameOver(true);
            setCurrentScreen('gameOver');

            // Save final game state
            setFinalGameState({ ...gameState });
            setFinalPlayerData({ ...players });

            // Show results after delay
            setTimeout(() => {
                setCurrentScreen('results');
                setShowResults(true);
            }, 50000); // 50 seconds 
        }
    }, [timeLeft, gameActive, gameState, players]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    // Get current motivation text for each player
    const getPlayerText = (playerCode) => {
        if (!playerCode || playerCode === "0") return "";
        return MOTIVATION_TEXTS[playerCode] || "";
    };

    // Get player scores and determine winner
    const dataToUse = (currentScreen === 'results' && finalGameState) ? finalGameState : gameState;
    const playersToUse = (currentScreen === 'results' && finalPlayerData) ? finalPlayerData : players;

    const playerOneScore = parseInt(dataToUse.p1_score) || 0;
    const playerTwoScore = parseInt(dataToUse.p2_score) || 0;


    // Determine winner
    const winner = dataToUse.p1_win_state ? playersToUse.playerOne :
        dataToUse.p2_win_state ? playersToUse.playerTwo : null;

    const winnerScore = dataToUse.p1_win_state ? playerOneScore : playerTwoScore;
    const loserScore = dataToUse.p1_win_state ? playerTwoScore : playerOneScore;
    const isPlayer1Winner = dataToUse.p1_win_state;
    //reset to new screen
    useEffect(() => {
        if (currentScreen === 'results') {
            const timeoutId = setTimeout(() => {
                setCurrentScreen('waiting');
                setGameOver(false);
                setShowResults(false);
                setFinalGameState(null);
                setFinalPlayerData(null);
            }, 500000);

            return () => clearTimeout(timeoutId);
        }
    }, [currentScreen]);


    return (
        <div className="game-container position-relative w-100 min-vh-100 overflow-hidden">
            {/* Background Video */}
            <video
                className="position-absolute w-100 h-100"
                style={{ objectFit: 'cover', zIndex: -1 }}
                autoPlay
                loop
                muted
            >
                <source src={During_Game} type="video/mp4" />
            </video>

            {/* Overlay */}
            <div
                className="position-absolute w-100 h-100"
                style={{
                    backgroundColor: 'rgba(0, 0, 40, 0.3)',
                    zIndex: -1
                }}
            ></div>

            {/* Centered Game Content */}
            <Container
                className="d-flex flex-column justify-content-center align-items-center text-center py-4"
                style={{ minHeight: '100vh' }}
            >
                {/* Waiting Screen */}
                {currentScreen === 'waiting' && (
                    <Waiting />
                )}

                {/* Game in progress UI */}
                {currentScreen === 'game' && (
                    <GameScreen
                        formatTime={formatTime}
                        timeLeft={timeLeft}
                        players={players}
                        playerOneScore={playerOneScore}
                        playerTwoScore={playerTwoScore}
                        getPlayerText={getPlayerText}
                        gameState={gameState}
                    />
                )}

                {/* Game Over Screen */}
                {currentScreen === 'gameOver' && (
                    <GameOverScreen
                        players={players}
                        playerOneScore={playerOneScore}
                        playerTwoScore={playerTwoScore}
                    />
                )}

                {/* Results Screen */}
                {currentScreen === 'results' && finalGameState && finalPlayerData && (
                <>
                <video
                    className="position-absolute w-100 h-100"
                    style={{ objectFit: 'cover', zIndex: -1 }}
                    autoPlay
                    loop
                    muted
                  >
                    <source src={Neon} type="video/mp4" />
                  </video>
                    <ResultsScreen
                        winner_background={winner_background}
                        winner={winner}
                        winnerScore={winnerScore}
                        isPlayer1Winner={isPlayer1Winner}
                        finalPlayerData={finalPlayerData}
                        playerOneScore={playerOneScore}
                        playerTwoScore={playerTwoScore}
                    />
                </>
                )}
            </Container>
        </div>
    );
};

export default SmasherGameUI;