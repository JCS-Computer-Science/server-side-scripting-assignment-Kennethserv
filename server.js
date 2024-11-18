const express = require("express");
const uuid = require("uuid");
const server = express();
server.use(express.json());
server.use(express.static('public'));

let activeSessions = {};
let gameStats = { wins: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}, losses: 0 };

const getSession = (sessionID, res) => {
    if (!sessionID) {
        res.status(400).send({ error: "Session ID is required" });
        return null;
    }
    const session = activeSessions[sessionID];
    if (!session) {
        res.status(404).send({ error: "Session not found" });
        return null;
    }
    return session;
};

const isGameOver = (gameState, guessResult) => {
    return gameState.remainingGuesses <= 0 || guessResult.every(item => item.result === 'RIGHT');
};

server.get('/newgame', (req, res) => {
    const newID = uuid.v4();
    const answer = (req.query.answer || "apple").toLowerCase();
    
    const newGame = {
        wordToGuess: answer,
        guesses: [],
        wrongLetters: [],
        closeLetters: [],
        rightLetters: [],
        remainingGuesses: 6,
        gameOver: false
    };
    
    activeSessions[newID] = newGame;
    res.status(201).send({ sessionID: newID });
});

server.get('/gamestate', (req, res) => {
    const sessionID = req.query.sessionID;
    const gameState = getSession(sessionID, res);

    if (gameState) {
        res.status(200).send({ gameState });
    }
});

//git add .
// git commit -m ""
//git push


module.exports = server;
