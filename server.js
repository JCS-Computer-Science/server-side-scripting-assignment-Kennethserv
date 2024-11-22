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

server.post('/guess', (req, res) => {
    const { sessionID, guess } = req.body;
    const gameState = getSession(sessionID, res);


    if (!gameState) return;


    const formattedGuess = (guess || "").toLowerCase();


    if (formattedGuess.length !== 5) {
        return res.status(400).send({ error: "Guess must be exactly 5 characters long" });
    }
    if (!/^[a-z]+$/.test(formattedGuess)) {
        return res.status(400).send({ error: "Guess must contain only letters" });
    }
    if (gameState.gameOver) {
        return res.status(400).send({ error: "Game is already over" });
    }
    const answer = gameState.wordToGuess;
    const guessResult = formattedGuess.split('').map((letter, index) => {
        let result;
        if (letter === answer[index]) {
            result = 'RIGHT';
            if (!gameState.rightLetters.includes(letter)) {
                gameState.rightLetters.push(letter);
            }
            gameState.closeLetters = gameState.closeLetters.filter(l => l !== letter);
        } else if (answer.includes(letter)) {
            result = 'CLOSE';
            if (!gameState.rightLetters.includes(letter) && !gameState.closeLetters.includes(letter)) {
                gameState.closeLetters.push(letter);
            }
        } else {
            result = 'WRONG';
            if (!gameState.wrongLetters.includes(letter)) {
                gameState.wrongLetters.push(letter);
            }
        }
        return { value: letter, result };
    });


    gameState.guesses.push(guessResult);
    gameState.remainingGuesses -= 1;
    gameState.gameOver = isGameOver(gameState, guessResult);


    const response = { gameState };
    if (gameState.gameOver) {
        response.wordToGuess = answer;


        // Track wins and losses based on the number of guesses
        if (guessResult.every(item => item.result === 'RIGHT')) {
            gameStats.wins[6 - gameState.remainingGuesses] += 1;
        } else {
            gameStats.losses += 1;
        }
    }

    res.status(201).send(response);
});


server.delete('/reset', (req, res) => {
    const sessionID = req.query.sessionID;
    const gameState = getSession(sessionID, res);


    if (!gameState) return;


    activeSessions[sessionID] = {
        wordToGuess: undefined,
        guesses: [],
        wrongLetters: [],
        closeLetters: [],
        rightLetters: [],
        remainingGuesses: 6,
        gameOver: false
    };
})





module.exports = server;
