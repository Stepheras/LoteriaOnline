
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Store the players currently in the game
let players = [];

// Keep track of the host and called cards
let hostId = null;
let calledCards = [];

// Keep track of the winner
let winner = null;

// Send everyone's current score to all connected players
function updateLeaderboard() {
    const leaderboard = players.map(player => ({
        name: player.name,
        score: player.marked.length
    }));

    io.emit("updateLeaderboard", leaderboard);
}


// Loteria cards represented by emojis
const cards = [
    { name: "El Sol", emoji: "☀️" },
    { name: "La Luna", emoji: "🌙" },
    { name: "La Estrella", emoji: "⭐" },
    { name: "El Corazón", emoji: "❤️" },
    { name: "La Sirena", emoji: "🧜‍♀️" },
    { name: "El Árbol", emoji: "🌳" },
    { name: "La Rosa", emoji: "🌹" },
    { name: "El Gallo", emoji: "🐓" },
    { name: "La Corona", emoji: "👑" },
    { name: "El Mundo", emoji: "🌎" },
    { name: "El Pescado", emoji: "🐟" },
    { name: "La Campana", emoji: "🔔" },
    { name: "La Botella", emoji: "🍾" },
    { name: "El Cantarito", emoji: "🏺" },
    { name: "El Paraguas", emoji: "☂️" },
    { name: "La Mano", emoji: "✋" },
    { name: "La Escalera", emoji: "🪜" },
    { name: "El Tambor", emoji: "🥁" },
    { name: "La Bandera", emoji: "🚩" },
    { name: "El Violín", emoji: "🎻" },
    { name: "La Bota", emoji: "👢" },
    { name: "El Cazo", emoji: "🥣" },
    { name: "La Sandía", emoji: "🍉" },
    { name: "El Venado", emoji: "🦌" }
];

// Create a random 4x4 board for a player
function createBoard() {
    // Make a copy so the original cards stay unchanged
    const shuffled = [...cards];

    // Randomly shuffle the cards
    shuffled.sort(() => Math.random() - 0.5);

    // Select the first 16 cards
    return shuffled.slice(0, 16);
}


 // Check if a player has completed a winning line
function checkWinner(player) {

    // All possible winning lines on a 4x4 board
    const winningLines = [
        // Horizontal rows
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],

        // Vertical columns
        [0, 4, 8, 12],
        [1, 5, 9, 13],
        [2, 6, 10, 14],
        [3, 7, 11, 15],

        // Diagonals
        [0, 5, 10, 15],
        [3, 6, 9, 12]
    ];

    // Check each possible winning line
    for (const line of winningLines) {

        // Check whether all 4 cards in the line are marked
        const completed = line.every(index => {
            const cardName = player.board[index].name;
            return player.marked.includes(cardName);
        });

        if (completed) {
            return true;
        }
    }

    // No winning line was found
    return false;
}

// Serve our HTML, CSS, and JavaScript files
app.use(express.static("public"));

// Listen for players connecting
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

	
    // When the host clicks Next Card
    socket.on("nextCard", () => {

		// Only the host can call cards, and only before a winner
		if (socket.id !== hostId || winner !== null) {
    		return;
		}

        // Find cards that have not been called
        const remainingCards = cards.filter(card =>
            !calledCards.some(called => called.name === card.name)
        );

        // Stop when all cards have been called
        if (remainingCards.length === 0) {
            io.emit("gameMessage", "All cards have been called!");
            return;
        }

        // Choose a random card
        const randomIndex = Math.floor(Math.random() * remainingCards.length);
        const selectedCard = remainingCards[randomIndex];

        // Save the card so it cannot be called again
        calledCards.push(selectedCard);

        console.log("Card called:", selectedCard.name);

        // Send the same card to ALL connected players
        io.emit("cardCalled", selectedCard);
    });


    // When a player clicks a card on their board
    socket.on("markCard", (cardName) => {

        // Find the player who clicked
        const player = players.find(p => p.id === socket.id);

        // Stop marking cards after someone wins
		if (!player || winner !== null) {
			return;
		}

        // Check if this card belongs to the player's board
        const onBoard = player.board.some(card =>
            card.name === cardName
        );

        // Check if the host has called this card
        const wasCalled = calledCards.some(card =>
            card.name === cardName
        );

        // Only allow valid cards to be marked
        if (!onBoard || !wasCalled) {
            return;
        }

        // Check whether the card is already marked
        if (player.marked.includes(cardName)) {
            // Remove the bean if clicked again
            player.marked = player.marked.filter(
                name => name !== cardName
            );
        } else {
            // Place a bean
            player.marked.push(cardName);
        }

        // Tell this player which cards are marked
        socket.emit("updateMarked", player.marked);

        // Update the leaderboard for everyone
        updateLeaderboard();
    });


    // When a player clicks the Loteria button
    socket.on("claimLoteria", () => {

        // Find the player who clicked the button
        const player = players.find(p => p.id === socket.id);

        if (!player || winner !== null) {
            return;
        }

        // Check whether the player has a winning line
        if (checkWinner(player)) {

            // Save the winner
            winner = player.name;

            console.log("Loteria winner:", winner);

            // Announce the winner to everyone
            io.emit("winnerAnnounced", winner);

        } else {
            // Only tell this player their claim was incorrect
            socket.emit("gameMessage",
                "You do not have a complete line yet!");
        }
    });


    // When a player enters their name
    socket.on("joinGame", (name) => {
        // Prevent the same connection from joining twice
        if (players.some(player => player.id === socket.id)) {
            return;
        }

        // Create a new player
	const player = {
    	id: socket.id,
    	name: String(name).trim().slice(0, 20),
    	board: createBoard(),
    	marked: []
	};


        if (player.name === "") {
            return;
        }

        // Add the player to our list
        players.push(player);
        

		// Make the first player the host
		if (hostId === null) {
    		hostId = socket.id;
		}

		// Tell this player whether they are the host
		socket.emit("hostStatus", socket.id === hostId);

		// Send the player's unique board
		socket.emit("yourBoard", player.board);

		// Show the current called card if the game already started

        // Show the current called card if the game already started
        if (calledCards.length > 0) {
            socket.emit("cardCalled", calledCards[calledCards.length - 1]);
        }

		// Show the winner to players who join late
		if (winner !== null) {
    		socket.emit("winnerAnnounced", winner);
		}
		
        // Update everyone's player list
        io.emit("updatePlayers", players);

        // Update everyone's leaderboard
        updateLeaderboard();
    });

	
    // When the host starts a new game
    socket.on("newGame", () => {

        // Only the host can reset the game
        if (socket.id !== hostId) {
            return;
        }

        // Clear the old game
        calledCards = [];
        winner = null;

        // Give every player a new board
        players.forEach(player => {
            player.board = createBoard();
            player.marked = [];

            // Send each player their own new board
            io.to(player.id).emit("yourBoard", player.board);
            io.to(player.id).emit("updateMarked", []);
        });

        // Reset the leaderboard
        updateLeaderboard();

        // Tell everyone the game has restarted
        io.emit("gameReset");
    });

    
    // When a player leaves
    socket.on("disconnect", () => {
        players = players.filter(player => player.id !== socket.id);

        // If the host leaves, assign a new host
        if (socket.id === hostId) {
            hostId = players.length > 0 ? players[0].id : null;

            if (hostId !== null) {
                io.to(hostId).emit("hostStatus", true);
            }
        }

        // Update everyone's player list
        io.emit("updatePlayers", players);
        
        updateLeaderboard();

        console.log("A user disconnected:", socket.id);
    });

});

// Start the server
server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
