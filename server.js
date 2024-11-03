const express = require('express')
const app = express()
const port = 3000
const server = app.listen(port)
const io = require('socket.io')(server)
const path = require('path');

app.use(express.static(__dirname + '/public'));

//Hello World line taken from the express website
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})


class Game {
    state;
    p1_id;
    p2_id;
    currentPlayer;
    gameActive = true;

    constructor(p1_id, p2_id){
       this.state = ["", "", "", "", "", "", "", "", ""];
       this.p1_id = p1_id;
       this.p2_id = p2_id;
       this.currentPlayer = this.player1;
       this.gameActive = true;
    }
}

let players = [];

//The 'connection' is a reserved event name in socket.io
//For whenever a connection is established between the server and a client
io.on('connection', (socket) => {
    socket.on('newPlayer', (data) => {
            console.log(`player with id ${socket.id} and username ${data} connected`);
            players.push({ id: socket.id, username: data});

            if (players.length == 2){
                const game = new Game(players[0].username, players[1].username);
                io.emit('startGame', game);
            }
    }); 

    socket.on('disconnect', () => {
        console.log(`player with id ${socket.id} disconnected`);
        players = players.filter((player) => player.id !== socket.id);
    });
});
