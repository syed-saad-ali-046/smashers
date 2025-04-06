import React, { useState, useEffect, useRef } from 'react';
import { Container } from 'reactstrap';
import Neon from "./asset/neon2.mp4";
import winner_background from "./asset/winner_background.mp4";
import During_Game from "./asset/default_video.mp4";
import Waiting from './Component/waiting';
import GameScreen from './Component/GameScreen';
import GameOverScreen from './Component/GameOverScreen';
import ResultsScreen from './Component/ResultScreen';
import { MOTIVATION_TEXTS } from './Constant/Constant';
import './Component/style.css'
import Avatar1 from './asset/Avatar6.jpg'
import Avatar2 from './asset/Avatar5.jpg'

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
        p2_text: "0",
        game_time: "0",
    });

    // UI state
    const [gameActive, setGameActive] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [currentScreen, setCurrentScreen] = useState('waiting');

    
    // Track if game has started to prevent timer resets
    const gameStartedRef = useRef(false);
    const initialGameTimeRef = useRef(null);

    // Player data
    const [players, setPlayers] = useState({
        playerOne: {
            name: "Player 1",
            avatar: Avatar2,
            hits: []
        },
        playerTwo: {
            name: "Player 2",
            avatar: Avatar1,
            hits: []
        }
    });

    // Preserve final game state for results screen
    const [finalGameState, setFinalGameState] = useState(null);
    const [finalPlayerData, setFinalPlayerData] = useState(null);
    const [p1Motivation, setP1Motivation] = useState("");
    const [p2Motivation, setP2Motivation] = useState("");

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

                        // Update game state based on received WebSocket data
                        setGameState(prevState => {
                            const newState = { ...prevState };
                            
                            // Update flags
                            if (data.hasOwnProperty('start_flag')) newState.start_flag = data.start_flag;
                            if (data.hasOwnProperty('stop_flag')) newState.stop_flag = data.stop_flag;
                            
                            // Update scores and win states
                            if (data.hasOwnProperty('p1_score')) newState.p1_score = data.p1_score;
                            if (data.hasOwnProperty('p2_score')) newState.p2_score = data.p2_score;
                            if (data.hasOwnProperty('p1_win_state')) newState.p1_win_state = data.p1_win_state;
                            if (data.hasOwnProperty('p2_win_state')) newState.p2_win_state = data.p2_win_state;
                            if (data.hasOwnProperty('p1_text')) newState.p1_text = data.p1_text;
                            if (data.hasOwnProperty('p2_text')) newState.p2_text = data.p2_text;
                            
                            // Handle game time with persistence
                            if (data.hasOwnProperty('game_time')) {
                                // Only update the timer if:
                                // 1. Game hasn't started yet (first time receiving time)
                                // 2. We're transitioning from waiting to active game
                                // 3. Game is being reset (both flags are 0)
                                if (
                                    !gameStartedRef.current || 
                                    (data.start_flag === 1 && data.stop_flag === 0 && !gameActive) || 
                                    (data.start_flag === 0 && data.stop_flag === 0)
                                ) {
                                    newState.game_time = data.game_time;
                                    
                                    // If game is starting, store initial time
                                    if (data.start_flag === 1 && data.stop_flag === 0) {
                                        initialGameTimeRef.current = data.game_time;
                                        gameStartedRef.current = true;
                                    }
                                    
                                    // If game is reset, clear the started flag
                                    if (data.start_flag === 0 && data.stop_flag === 0) {
                                        gameStartedRef.current = false;
                                        initialGameTimeRef.current = null;
                                    }
                                }
                            }

                            // Transition based on start_flag and stop_flag values
                            if (data.start_flag === 0 && data.stop_flag === 0) {
                                // Show waiting screen
                                setCurrentScreen('waiting');
                                setGameActive(false);
                                setGameOver(false);
                                setShowResults(false);
                                // Reset game started flag when returning to waiting
                                gameStartedRef.current = false;
                                initialGameTimeRef.current = null;
                            } else if (data.start_flag === 1 && data.stop_flag === 0) {
                                // Game starting
                                setCurrentScreen('game');
                                setGameActive(true);
                                setGameOver(false);
                                setShowResults(false);
                                // Mark that game has started
                                gameStartedRef.current = true;
                                // Capture initial time if not yet set
                                if (initialGameTimeRef.current === null) {
                                    initialGameTimeRef.current = data.game_time;
                                }
                            } else if (data.start_flag === 0 && data.stop_flag === 1) {
                                // Show winner screen
                                setCurrentScreen('results');
                                setGameActive(false);
                                setGameOver(true);
                                setShowResults(true);
                                // Reset game started flag when game is over
                                gameStartedRef.current = false;
                                initialGameTimeRef.current = null;
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

        // Try to recover game state from localStorage on refresh
        const savedGameState = localStorage.getItem('gameState');
        if (savedGameState) {
            const parsedState = JSON.parse(savedGameState);
            if (parsedState.start_flag === 1 && parsedState.stop_flag === 0) {
                setGameState(parsedState);
                gameStartedRef.current = true;
                initialGameTimeRef.current = parsedState.game_time;
                setCurrentScreen('game');
                setGameActive(true);
            }
        }

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

    // Save game state to localStorage when it changes and game is active
    useEffect(() => {
        if (gameActive) {
            localStorage.setItem('gameState', JSON.stringify(gameState));
        } else if (currentScreen === 'waiting') {
            // Clear saved state when back to waiting
            localStorage.removeItem('gameState');
        }
    }, [gameState, gameActive, currentScreen]);

    console.log("Backend Value:", parseInt(gameState.game_time))
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

                // Clear any saved game state
                localStorage.removeItem('gameState');

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
                
                // Clear saved state when back to waiting
                localStorage.removeItem('gameState');
            }
        };

        handleGameStateChange();
    }, [gameState, gameActive, players, currentScreen]);

    const getRandomMotivation = (status) => {
        const id = Number(status);
        const statusGroup = MOTIVATION_TEXTS.find(group => group.id === id);
        const targetGroup = statusGroup || MOTIVATION_TEXTS.find(group => group.id === 1);
        return targetGroup.texts[Math.floor(Math.random() * targetGroup.texts.length)];
    };
        
    useEffect(() => {
        setP1Motivation(getRandomMotivation(gameState.p1_text));
        setP2Motivation(getRandomMotivation(gameState.p2_text)); 
        const interval = setInterval(() => {
            setP1Motivation(getRandomMotivation(gameState.p1_text));
            setP2Motivation(getRandomMotivation(gameState.p2_text));
        }, 5000);
    
        return () => clearInterval(interval);
    }, [gameState.p1_text, gameState.p2_text]);

    const getPlayerText = (textCode) => {
        // Compare the provided textCode with gameState values.
        if (textCode === gameState.p1_text) {
            return p1Motivation;
        } else if (textCode === gameState.p2_text) {
            return p2Motivation;
        }
        return "";
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
                
                // Clear saved state
                localStorage.removeItem('gameState');
            }, 500000);

            return () => clearTimeout(timeoutId);
        }
    }, [currentScreen]);

    // Handle window beforeunload event to preserve game state
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (gameActive) {
                localStorage.setItem('gameState', JSON.stringify(gameState));
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [gameState, gameActive]);

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
                        timeLeft={gameState.game_time}
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