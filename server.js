const express = require('express')
const app = express()
const port = 3000
const server = app.listen(port)
const io = require('socket.io')(server)
const path = require('path');
const { randomBytes } = require('node:crypto');
const { arch } = require('os')

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})

console.log(`Server running on port ${port}`);

// Winning conditions for the game
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Class to represent a game of Tic Tac Toe
class Game {
    state;
    p1_id;
    p2_id;
    nextMove;
    gameActive;
    game_id;
    winner;

    constructor(){
        // Initialize a new game
        this.state = ["", "", "", "", "", "", "", "", ""];
        this.p1_id = null;
        this.p2_id = null;
        this.nextMove = 'X';
        this.gameActive = true;
        this.game_id = randomBytes(5).toString("hex");
     }

    // Add a player to the game
    addPlayer(username){
        if (this.p1_id == null && this.p2_id == null) {
            // asign it randomnly
            if (Math.random() < 0.5) {
                this.p1_id = username;
            } else {
                this.p2_id = username;
            }

            return;
        }

        if (this.p1_id == null) {
            this.p1_id = username;
            return;
        } else if (this.p2_id == null) {
            this.p2_id = username;
            return;
        }
    }

    // Check if a move is valid
    isValidMove(index) {
        return (this.state[index] === '') && (this.p1_id != null) && (this.p2_id != null);
    }

    // Check if the game is over
    checkGameOver(){
        for (let i = 0; i <= 7; i++) {
            const winCondition = winningConditions[i];
            let a = this.state[winCondition[0]];
            let b = this.state[winCondition[1]];
            let c = this.state[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                this.gameActive = false;
                this.winner = (a === 'X') ? this.p1_id : this.p2_id;
                return true;
            }
        }

        // Check for a draw
        if (!this.state.includes('')) {
            this.winner = null;
            this.gameActive = false;
            return true;
        }

        return false;
    }
}

// List of all players
let players = [];
// List of all archived games
let archived_games = [];
// List of all active games
let active_games = [];

// When a client connects
io.on('connection', (socket) => {
    io.emit('numPlayers', players.length, active_games.length);

    // When a client wants to create a new room
    socket.on('newRoom', (data) => {
            console.log(`socket with id ${socket.id} and username ${data} connected`);
            players.push({ id: socket.id, username: data});

            const game = new Game();
            game.addPlayer(data);
            active_games.push(game);

            socket.join(game.game_id);
            socket.emit('roomCreated', game.game_id);
            io.emit('numPlayers', players.length, active_games.length);
    });

    // When a client wants to enter a room
    socket.on('enterRoom', (data) => {
        console.log(`player with id ${socket.id} and username ${data} connected`);
        players.push({ id: socket.id, username: data});
        socket.emit('showRooms', active_games);
        io.emit('numPlayers', players.length, active_games.length);
    });

    // When a client wants to join a room
    socket.on('joinRoom', (game_id, username) => {
        let index = active_games.findIndex((a) => a.game_id == game_id);
        if (index === -1) { console.log("ERROR: GAME NOT FOUND"); return; }
        active_games[index].addPlayer(username);
        socket.join(game_id);

        io.in(game_id).emit('startGame', active_games[index]);
        io.in(game_id).emit('updateGame', active_games[index]);
        io.emit('numPlayers', players.length, active_games.length);
    })

    // When a client makes a move
    socket.on('playerMove', (game_id, cell_index) => {
        let index = active_games.findIndex((a) => a.game_id == game_id);
        if (index === -1) { console.log("ERROR: GAME NOT FOUND"); return; }

        if (!active_games[index].isValidMove(cell_index)){
            return;
        }

        active_games[index].state[cell_index] = active_games[index].nextMove;
        active_games[index].nextMove = active_games[index].nextMove === 'X' ? 'O' : 'X';
        io.in(active_games[index].game_id).emit('updateGame', active_games[index]);

        if (active_games[index].checkGameOver()) {
            active_games[index].gameActive = false;
            archived_games.push(active_games[index]);
            io.in(active_games[index].game_id).emit('gameOver', archived_games[archived_games.length - 1]);
            players = players.filter((player) => player.username !== active_games[index].p1_id && player.username !== active_games[index].p2_id);
            active_games.splice(index, 1);
            io.emit('numPlayers', players.length, active_games.length);
        }
    });

    socket.on('leaveRoom', (game_id, username) => {
        let index = active_games.findIndex((a) => a.game_id == game_id);
        if (index === -1) { console.log("ERROR: GAME NOT FOUND"); return; }
        active_games[index].gameActive = false;
        active_games[index].winner = undefined;
        io.in(active_games[index].game_id).emit('gameOver', archived_games[archived_games.length - 1]);
        players = players.filter((player) => player.username !== active_games[index].p1_id && player.username !== active_games[index].p2_id);
        active_games.splice(index, 1);
        io.emit('numPlayers', players.length, active_games.length);        
    });

    // When a client disconnects
    socket.on('disconnect', () => {
        user = players.find((player) => player.id === socket.id);
        players = players.filter((player) => player.id !== socket.id);

        console.log(`socket with id ${socket.id} disconnected`);

        if (user != undefined){
            user = user.username;   

            for (let i = 0; i < active_games.length; i++) {
                if (active_games[i].p1_id == user || active_games[i].p2_id == user) {
                    active_games[i].gameActive = false;
                    active_games[i].winner = undefined;
                    io.in(active_games[i].game_id).emit('gameOver', active_games[i]);
                    archived_games.push(active_games[i]);
                    active_games.splice(i, 1);
                    break;
                }
            }
        }

        io.emit('numPlayers', players.length, active_games.length);
    });
});

