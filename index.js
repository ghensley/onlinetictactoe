var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

let game = 0;
let players = 0;

games = {}

io.on('connection', socket => {
	let room = 'room-' + game
	games[room] = {
		board: [
			"","","","","","","","",""
		],
		currentTurn: 1
	};
	let playerNumber;
	let symbol;

	socket.join(room);

	if (players % 2 == 1) {
		io.in(room).emit('message', { text: "Game is starting" })
		io.in(room).emit('game-state', games[room]);
		socket.emit('message', { text: "You go second."});
		playerNumber = 2;
		symbol = "O";
		game++;
	} else {
		socket.emit('message', { text: "You go first." });
		playerNumber = 1;
		symbol = "X"
	}
	players++;
	socket.emit('message', { text: "You joined " + room});
	socket.to(room).emit('message', { text: "Another player joined " + room });

	socket.on('place', data => {
		if (games[room].currentTurn === playerNumber) {
			if (games[room].board[data.index] === "") {
				games[room].board[data.index] = symbol
				games[room].currentTurn = games[room].currentTurn === 1 ? 2 : 1;
				io.in(room).emit('game-state', games[room]);
			} else {
				socket.emit('message', {text: "That's not a valid move!"})
			}
		} else {
			socket.emit('message', {text: "It's not your turn!"})
		}
	});
	socket.on('chat-message', msg => {
    	io.emit('message', { text: "Player " + playerNumber + ": " + msg});
  	});
});



http.listen(3000, () => {
	console.log('listening...')
});