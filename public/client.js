
//Establishing a connection with the server
const socket = io();
let game_id;
let username;

document.getElementById("play--container").style.display = "none";
document.getElementById("waiting--container").style.display = "none";
document.getElementById("submit-name").addEventListener('click', () => {
    username = document.getElementById("name").value;
    socket.emit('newPlayer', username);

    document.getElementById("enter-name").style.display = "none";
    document.getElementById("waiting--container").style.display = "flex";
});

socket.on('startGame', (game) => {
    document.getElementById("waiting--container").style.display = "none";
    document.getElementById("play--container").style.display = "flex";

    const p1 = document.querySelector('.p1--id');
    const p2 = document.querySelector('.p2--id');
    p1.innerHTML = game.p1_id;
    p2.innerHTML = game.p2_id;

    document.getElementById("game--status").innerHTML = game.currentPlayer + " turn";
    console.log(game.game_id + " has started");
    game_id = game.game_id;
});

let cells = document.getElementsByClassName("cell");
function handleCellClick(cellIndex) {
    socket.emit('playerMove', game_id, cellIndex);
}

let clickHandlers = [];

function createCellClickListener(cellIndex) {
    return function() {
      handleCellClick(cellIndex);
    };
}

for (let i = 0; i < cells.length; i++) {
    const clickHandler = createCellClickListener(i);
    clickHandlers.push(clickHandler);
    cells[i].addEventListener("click", clickHandlers[i]);
}

socket.on('updateGame', (game) => {
    console.log(JSON.stringify(game));
    document.getElementById("game--status").innerHTML = game.currentPlayer + " turn";

    for(let i = 0; i < 9; i++) {
        document.getElementsByClassName('game--container')[0].children[i].innerHTML = game.state[i];
    }
});

socket.on('gameOver', (game) => { 
    if (game.winner === null) {
        document.getElementById("game--status").innerHTML = "Draw!";
    } else {
        document.getElementById("game--status").innerHTML = game.winner + " wins!";
    }

    document.getElementsByClassName("new-game--button").innerHTML = "New game";
    for (let i = 0; i < cells.length; i++) {
        cells[i].removeEventListener("click", clickHandlers[i]);
    }
});

document.getElementById('new-game--button').addEventListener("click", () => {
    socket.emit('newGame');
});



// //Client sends a message at the moment it got connected with the server
// socket.emit('clientToServer', "Hello, server!");
