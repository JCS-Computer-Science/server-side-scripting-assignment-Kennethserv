const express = require("express");
const uuid = require("uuid")
const server = express();
server.use(express.json())


//All your code goes here
let activeSessions={}


server.get('/newgame', (req,res)=>(
    let newID = uuld.v4()
    let newgame ={    
        wordToGuess: "apple",
        guesses:[
    [
        {value:'p', result:'CLOSE'},
        {value:'h', result:'WRONG'},
        {value:'a', result:'CLOSE'},
        {value:'s', result:'WRONG'},
        {value:'e', result:'RIGHT'},
    ],
    [
        {value:'a', result:'RIGHT'},
        {value:'n', result:'WRONG'},
        {value:'g', result:'WRONG'},
        {value:'l', result:'RIGHT'},
        {value:'e', result:'RIGHT'},
    ]
],
wrongLetters: ['h','s','n','g'],
closeLetters: ['p'], //'a' is no longer close because it has been guessed in the correct spot
rightLetters: ['e','a','e'],
remainingGuesses: 4,
gameOver: false

)
        activeSessions[newID] = newgame
        res.status(201)
        res.send((sessionId: newID))
//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;