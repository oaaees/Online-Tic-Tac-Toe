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

class Game {
    state;
    p1_id;
    p2_id;
    currentPlayer;
    gameActive;
    game_id;
    winner;

    constructor(){
        this.state = ["", "", "", "", "", "", "", "", ""];
        this.p1_id = null;
        this.p2_id = null;
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.game_id = randomBytes(5).toString("hex");
     }

    addPlayer(username){
        if (this.p1_id == null) {
            this.p1_id = username;
            return;
        } else if (this.p2_id == null) {
            this.p2_id = username;
            return;
        }
    }

    isValidMove(index) {
        return (this.state[index] === '') && (this.p1_id != null) && (this.p2_id != null);
    }

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

        // check for a draw
        if (!this.state.includes('')) {
            this.winner = null;
            this.gameActive = false;
            return true;
        }

        return false;
    }
}

let players = [];
let archived_games = [];
let active_games = [];

//The 'connection' is a reserved event name in socket.io
//For whenever a connection is established between the server and a client
io.on('connection', (socket) => {
    socket.on('newRoom', (data) => {
            console.log(`player with id ${socket.id} and username ${data} connected`);
            players.push({ id: socket.id, username: data});

            const game = new Game();
            game.addPlayer(data);
            active_games.push(game);

            // io.emit('startGame', game);
            // io.emit('updateGame', game);
            
            socket.join(game.game_id);
            socket.emit('roomCreated', game.game_id);
    });

    socket.on('enterRoom', (data) => {
        console.log(`player with id ${socket.id} and username ${data} connected`);
        players.push({ id: socket.id, username: data});
        socket.emit('showRooms', active_games);
    });

    socket.on('joinRoom', (game_id, username) => {
        let index = active_games.findIndex((a) => a.game_id == game_id);
        if (index === -1) { console.log("ERROR: GAME NOT FOUND"); return; }
        active_games[index].addPlayer(username);
        socket.join(game_id);

        io.in(game_id).emit('startGame', active_games[index]);
        io.in(game_id).emit('updateGame', active_games[index]);
    })
    
    socket.on('playerMove', (game_id, cell_index) => {
        let index = active_games.findIndex((a) => a.game_id == game_id);
        if (index === -1) { console.log("ERROR: GAME NOT FOUND"); return; }

        if (!active_games[index].isValidMove(cell_index)){
            return;
        }

        active_games[index].state[cell_index] = active_games[index].currentPlayer;
        active_games[index].currentPlayer = active_games[index].currentPlayer === 'X' ? 'O' : 'X';
        io.in(active_games[index].game_id).emit('updateGame', active_games[index]);

        if (active_games[index].checkGameOver()) {
            archived_games.push(active_games[index]);
            io.in(active_games[index].game_id).emit('gameOver', archived_games[archived_games.length - 1]);
            active_games.splice(index, 1);
            return;
        }
    });

    socket.on('disconnect', () => {
        user = players.find((player) => player.id === socket.id);
        players = players.filter((player) => player.id !== socket.id);

        if (user != undefined) user = user.username;


        for (let i = 0; i < active_games.length; i++) {
            if (active_games[i].p1_id == user || active_games[i].p2_id == user) {
                active_games[i].gameActive = false;
                io.in(active_games[i].game_id).emit('gameOver', active_games[i]);
                archived_games.push(active_games[i]);
                active_games.splice(i, 1);
                break;
            }
        }
    });
});
