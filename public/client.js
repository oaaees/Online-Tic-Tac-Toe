
//Establishing a connection with the server
const socket = io('/');
let game_id;
let username;

document.getElementById("play--container").style.display = "none";
document.getElementById("waiting--container").style.display = "none";
document.getElementById("rooms--container").style.display = "none";

document.getElementById("create-room--btn").addEventListener('click', () => {
    username = document.getElementById("name").value;

    if (username == "") {
        alert("Please enter a username");
        return;
    }

    socket.emit('newRoom', username);

    document.getElementById("enter-name").style.display = "none";
    document.getElementById("waiting--container").style.display = "flex";
});

document.getElementById("enter-room--btn").addEventListener('click', () => {
    username = document.getElementById("name").value;

    if (username == "") {
        alert("Please enter a username");
        return;    
    }

    socket.emit('enterRoom', username);
});

socket.on('roomCreated', (game_id) => {
    document.getElementById("room-id").innerHTML = "Your room id is: " + game_id;
})

socket.on('showRooms', (rooms) => {
    document.getElementById("enter-name").style.display = "none";
    document.getElementById("rooms--container").style.display = "flex";

    let roomList = document.getElementById("rooms--list");

    for(let i = 0; i < rooms.length; i++) {
        let room = document.createElement("button");
        room.innerHTML = rooms[i].game_id;
        roomList.appendChild(room);

        room.addEventListener("click", () => {
            socket.emit('joinRoom', rooms[i].game_id, username);
        });
    }
})

socket.on('startGame', (game) => {
    document.getElementById("rooms--container").style.display = "none";
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
}

socket.on('updateGame', (game) => {
    document.getElementById("game--status").innerHTML = game.currentPlayer + " turn";

    for(let i = 0; i < 9; i++) {
        document.getElementsByClassName('game--container')[0].children[i].innerHTML = game.state[i];
    }

    if(game.currentPlayer == 'O' && username == game.p1_id || game.currentPlayer == 'X' && username == game.p2_id) {
        for (let i = 0; i < cells.length; i++) {
            cells[i].removeEventListener("click", clickHandlers[i]);
        }
    } else {
        for (let i = 0; i < cells.length; i++) {
            cells[i].addEventListener("click", clickHandlers[i]);
        }
    }
});

socket.on('gameOver', (game) => { 
    console.log(JSON.stringify(game));
    if (game.winner === null) {
        document.getElementById("game--status").innerHTML = "Draw!";
    } else if (game.winner === undefined) {
        document.getElementById("game--status").innerHTML = "Player disconnected";
    } else {
        document.getElementById("game--status").innerHTML = game.winner + " wins!";
    }
    
    for (let i = 0; i < cells.length; i++) {
        cells[i].removeEventListener("click", clickHandlers[i]);
    }
});


document.getElementById("new-game--btn").addEventListener('click', () => {
    socket.emit('newRoom', username);

    document.getElementById("play--container").style.display = "none";
    document.getElementById("enter-name").style.display = "none";
    document.getElementById("waiting--container").style.display = "flex";
})