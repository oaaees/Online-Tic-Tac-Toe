const express = require('express')
const app = express()
const port = 3000
const server = app.listen(port)
const io = require('socket.io')(server)
const path = require('path');
const { randomBytes } = require('node:crypto');
const { arch } = require('os')

app.use(express.static(__dirname + '/public'));

//Hello World line taken from the express website
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

    constructor(p1_id, p2_id){
       this.state = ["", "", "", "", "", "", "", "", ""];
       this.p1_id = p1_id;
       this.p2_id = p2_id;
       this.currentPlayer = 'X';
       this.gameActive = true;
       this.game_id = randomBytes(16).toString("hex");
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
                this.winner = (this.currentPlayer === 'X') ? this.p1_id : this.p2_id;
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
    socket.on('newPlayer', (data) => {
            console.log(`player with id ${socket.id} and username ${data} connected`);
            players.push({ id: socket.id, username: data});

            if (players.length == 2){
                const game = new Game(players[0].username, players[1].username);
                active_games.push(game);
                io.emit('startGame', game);
            }
    });
    
    socket.on('playerMove', (game_id, cell_index) => {
        console.log(`game with id ${game_id} moved to cell ${cell_index}`);
        let index = active_games.findIndex((a) => a.game_id == game_id);

        if (index === -1) { console.log("ERROR: GAME NOT FOUND"); return; }

        active_games[index].state[cell_index] = active_games[index].currentPlayer;
        io.emit('updateGame', active_games[index]);

        if (active_games[index].checkGameOver()) {
            archived_games.push(active_games[index]);
            io.emit('gameOver', archived_games[archived_games.length - 1]);
            active_games.splice(index, 1);
            return;
        } else {
            active_games[index].currentPlayer = active_games[index].currentPlayer === 'X' ? 'O' : 'X';
        }
    });

    socket.on('disconnect', () => {
        console.log(`player with id ${socket.id} disconnected`);
        players = players.filter((player) => player.id !== socket.id);
    });
});
