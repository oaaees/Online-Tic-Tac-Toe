# Online-Tic-Tac-Toe

A real-time, multiplayer Tic-Tac-Toe game implemented with [Node.js](https://nodejs.org/en) using [Express](https://expressjs.com/) and [Socket.io](https://socket.io/)

## How to run

Install Node.js and run the command from this project folder:

`node install`

After all the dependecies are installed, you can start the server with:

`node server.js`

Server runs on `http://localhost:3000` you can visit it in your web browser.

## How it works

1. When a user connects to the server, they are given a unique id and they are asked for a username.
2. The user can then create a new room or enter an existing room.
3. When a user creates a new room, a new game object is created and the user is added to the game.
4. When a user enters an existing room, they are added to the game if there is an open spot.
5. When both players have joined the game, the game starts.
6. The players take turns clicking on a cell.
7. If a player clicks on a cell that is already occupied, nothing happens.
8. If a player clicks on an empty cell, their mark is placed in the cell and it is the other player's turn.
9. If a player gets three of their marks in a row, they win the game and the game is over.
10. If all of the cells are filled and no player has won, the game is a draw and the game is over.
11. When the game is over, the game is added to an array of archived games and the players are removed from the game.
12. When a player disconnects, if they are in a game, the game is ended and the other player is notified.

## Cómo Ejecutar

Instala Node.js y ejecuta el siguiente comando:

`node install`

Luego de instalar todas las dependencias, ejecuta el comando para crear el servidor:

`node server.js`

El servidor se ejecutará en `http://localhost:3000` puedes visitar esta dirección en tu navegador web

## Cómo funciona

1. Cuando un usuario se conecta al servidor, se le asigna un ID y se le pide un nombre de usuario.
2. A continuación, el usuario puede crear una nueva sala o entrar en una ya existente.
3. Cuando un usuario crea una nueva sala, se crea un nuevo objeto Game y el usuario se añade al juego.
4. Cuando un usuario entra en una sala existente, se le añade al juego si hay un lugar disponible.
5. Cuando ambos jugadores se han unido a la sala, la partida comienza.
6. Los jugadores se turnan para hacer click en una celda.
7. Si un jugador hace click en una celda que ya está ocupada, no ocurre nada.
8. Si un jugador hace click en una celda vacía, su marca se coloca en la celda y es el turno del otro jugador.
9. Si un jugador consigue tres de sus marcas seguidas, gana la partida y el juego termina.
10. Si todas las casillas están llenas y ningún jugador ha ganado, el juego es un empate y el juego termina.
11. Cuando el juego termina, el juego se añade a una matriz de juegos archivados y los jugadores son retirados del juego.
12. Cuando un jugador se desconecta, si está en una partida, ésta finaliza y se notifica al otro jugador.