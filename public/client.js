
//Establishing a connection with the server
const socket = io();

document.getElementById("play--container").style.display = "none";
document.getElementById("waiting--container").style.display = "none";
document.getElementById("submit-name").addEventListener('click', () => {
    let username = document.getElementById("name").value;
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
});

// //Client sends a message at the moment it got connected with the server
// socket.emit('clientToServer', "Hello, server!");
