// Establishing a connection with the server
const socket = io('/', { reconnect: false });
let game_id;
let username;

// Hide unnecessary containers at the start
document.getElementById("play--container").style.display = "none";
document.getElementById("waiting--container").style.display = "none";
document.getElementById("rooms--container").style.display = "none";

socket.on('numPlayers', (numPlayers, numGames) => {
    document.getElementById("num-players").innerHTML = "There are " + numPlayers + " players and " + numGames + " active games";
});

// Handle 'Create Room' button click
document.getElementById("create-room--btn").addEventListener('click', () => {
    username = document.getElementById("name").value;

    // Ensure username is entered
    if (username == "") {
        alert("Please enter a username");
        return;
    }

    // Emit 'newRoom' event to server with username
    socket.emit('newRoom', username);

    // Update UI to show waiting container
    document.getElementById("enter-name").style.display = "none";
    document.getElementById("waiting--container").style.display = "flex";
});

// Handle 'Enter Room' button click
document.getElementById("enter-room--btn").addEventListener('click', () => {
    username = document.getElementById("name").value;

    // Ensure username is entered
    if (username == "") {
        alert("Please enter a username");
        return;    
    }

    // Emit 'enterRoom' event to server with username
    socket.emit('enterRoom', username);
});

// Handle 'roomCreated' event from server
socket.on('roomCreated', (game_id) => {
    document.getElementById("room-id").innerHTML = "Your room id is: " + game_id;
})

// Handle 'showRooms' event to display available rooms
socket.on('showRooms', (rooms) => {
    document.getElementById("enter-name").style.display = "none";
    document.getElementById("rooms--container").style.display = "flex";

    let roomList = document.getElementById("rooms--list");
    roomList.innerHTML = "";

    // Create buttons for each available room
    for(let i = 0; i < rooms.length; i++) {
        let room = document.createElement("button");

        if (rooms[i].p2_id == null) {
            room.innerHTML = rooms[i].game_id + " - Player: " + rooms[i].p1_id
            room.addEventListener("click", () => {
                socket.emit('joinRoom', rooms[i].game_id, username);
            });
        } else if (rooms[i].p1_id == null) {
            room.innerHTML = rooms[i].game_id + " - Player: " + rooms[i].p2_id
            room.addEventListener("click", () => {
                socket.emit('joinRoom', rooms[i].game_id, username);
            });           
        } else {
            room.innerHTML = rooms[i].game_id + " - Full";
            room.disabled = true;
        }
        
        roomList.appendChild(room);

        // Handle room button click to join a room

    }
})

// Handle 'startGame' event to initialize game UI
socket.on('startGame', (game) => {
    document.getElementById("rooms--container").style.display = "none";
    document.getElementById("waiting--container").style.display = "none";
    document.getElementById("play--container").style.display = "flex";

    const p1 = document.querySelector('.p1--id');
    const p2 = document.querySelector('.p2--id');
    p1.innerHTML = game.p1_id;
    p2.innerHTML = game.p2_id;

    document.getElementById("game--status").innerHTML = game.nextMove + " turn";
    console.log(game.game_id + " has started");
    game_id = game.game_id;
});

// Prepare click handlers for each cell in the game grid
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

// Assign click handlers to cells
for (let i = 0; i < cells.length; i++) {
    const clickHandler = createCellClickListener(i);
    clickHandlers.push(clickHandler);
}

// Handle 'updateGame' event to update game state
socket.on('updateGame', (game) => {
    let clientTurn = game.nextMove == 'O' && username == game.p2_id || game.nextMove == 'X' && username == game.p1_id;

    if (!clientTurn) {
        document.getElementById("game--status").innerHTML = "Wait for your turn";
    } else {
        document.getElementById("game--status").innerHTML = "It's your turn!";
    }


    // Update the UI with the current game state
    for(let i = 0; i < 9; i++) {
        document.getElementsByClassName('game--container')[0].children[i].innerHTML = game.state[i];
    }

    // Disable clicks for the inactive player
    if(!clientTurn) {
        for (let i = 0; i < cells.length; i++) {
            cells[i].removeEventListener("click", clickHandlers[i]);
        }
    } else {
        for (let i = 0; i < cells.length; i++) {
            cells[i].addEventListener("click", clickHandlers[i]);
        }
    }
});

// Handle 'gameOver' event to display the result
socket.on('gameOver', (game) => { 
    console.log(JSON.stringify(game));
    if (game.winner === null) {
        document.getElementById("game--status").innerHTML = "Draw!";
    } else if (game.winner === undefined) {
        document.getElementById("game--status").innerHTML = "Player disconnected";
    } else {
        document.getElementById("game--status").innerHTML = game.winner + " wins!";
    }
    
    // Remove click listeners when game is over
    for (let i = 0; i < cells.length; i++) {
        cells[i].removeEventListener("click", clickHandlers[i]);
    }
});

// Handle 'New Game' button click to create a new room
document.getElementById("new-game--btn").addEventListener('click', () => {
    document.getElementById("play--container").style.display = "none";
    document.getElementById("waiting--container").style.display = "none";
    document.getElementById("rooms--container").style.display = "none";
    document.getElementById("enter-name").style.display = "flex";

    document.getElementById("name").value = username;
    socket.emit('leaveRoom', game_id, username);
});
