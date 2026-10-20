//This will be the code that connects the players
//to the server 

// Connect to our Socket.IO server
const socket = io();

// Get the HTML elements
const joinButton = document.getElementById("joinButton");
const playerName = document.getElementById("playerName");
const joinSection = document.getElementById("joinSection");
const lobbySection = document.getElementById("lobbySection");
const playerCount = document.getElementById("playerCount");
const playerList = document.getElementById("playerList");

// When the player clicks Join Game
joinButton.addEventListener("click", () => {
    const name = playerName.value.trim();

    if (name === "") {
        alert("Please enter your name!");
        return;
    }

    // Send the player's name to the server
    socket.emit("joinGame", name);

    // Hide the join form and show the lobby
    joinSection.style.display = "none";
    lobbySection.style.display = "block";
});

// Receive the updated player list from the server
socket.on("updatePlayers", (players) => {
    // Update the number of players
    playerCount.textContent = players.length;

    // Clear the old list
    playerList.innerHTML = "";

    // Display every player's name
    players.forEach((player) => {
        const li = document.createElement("li");
        li.textContent = "🎮 " + player.name;
        playerList.appendChild(li);
    });
});

// Receive the player's unique Loteria board
socket.on("yourBoard", (board) => {
    const gameBoard = document.getElementById("gameBoard");

    // Clear any previous board
    gameBoard.innerHTML = "";

    // Display each card on the board
    board.forEach((card) => {
        const cardElement = document.createElement("div");

        cardElement.className = "loteriaCard";
        
        
		// Remember which Loteria card this represents
		cardElement.dataset.cardName = card.name;

		// Send the clicked card to the server
		cardElement.addEventListener("click", () => {
    		socket.emit("markCard", card.name);
		});


        const emoji = document.createElement("span");
        emoji.className = "cardEmoji";
        emoji.textContent = card.emoji;

        const name = document.createElement("span");
        name.textContent = card.name;

        cardElement.appendChild(emoji);
        cardElement.appendChild(name);

        gameBoard.appendChild(cardElement);
    });
});


// Get the host controls and called card elements
const hostControls = document.getElementById("hostControls");
const nextCardButton = document.getElementById("nextCardButton");
const currentCard = document.getElementById("currentCard");
const gameMessage = document.getElementById("gameMessage");

// Show host controls only to the host
socket.on("hostStatus", (isHost) => {
    hostControls.style.display = isHost ? "block" : "none";
});

// When the host clicks the Next Card button
nextCardButton.addEventListener("click", () => {
    socket.emit("nextCard");
});

// Receive the card called by the host
socket.on("cardCalled", (card) => {
    currentCard.innerHTML = "";

    const emoji = document.createElement("div");
    emoji.className = "calledEmoji";
    emoji.textContent = card.emoji;

    const name = document.createElement("h3");
    name.textContent = card.name;

    currentCard.appendChild(emoji);
    currentCard.appendChild(name);
});

// Display messages sent by the server
socket.on("gameMessage", (message) => {
    gameMessage.textContent = message;
});


// Receive the player's marked cards from the server
socket.on("updateMarked", (markedCards) => {

    // Get every card on the board
    const boardCards = document.querySelectorAll(".loteriaCard");

    boardCards.forEach((card) => {

        // Check if this card has a bean
        const isMarked = markedCards.includes(card.dataset.cardName);

        // Add or remove the marked style
        card.classList.toggle("marked", isMarked);
    });
});

// Receive the live leaderboard
socket.on("updateLeaderboard", (players) => {

    const leaderboard = document.getElementById("leaderboard");

    // Clear the previous leaderboard
    leaderboard.innerHTML = "";

    // Sort players by their number of beans
    players.sort((a, b) => b.score - a.score);

    // Display the players and their scores
    players.forEach((player) => {
        const li = document.createElement("li");

        li.textContent = player.name + " - " +
                         player.score + " beans";

        leaderboard.appendChild(li);
    });
});


// Get the Loteria button and winner elements
const loteriaButton = document.getElementById("loteriaButton");
const winnerSection = document.getElementById("winnerSection");
const winnerName = document.getElementById("winnerName");

// Send a Loteria claim to the server
loteriaButton.addEventListener("click", () => {
    socket.emit("claimLoteria");
});

// Receive the winner announcement
socket.on("winnerAnnounced", (winner) => {

    // Display the winner
    winnerName.textContent = winner + " won the game! 🎉";
    winnerSection.style.display = "block";

    // Disable the Loteria button
    loteriaButton.disabled = true;

    // Hide the host's Next Card button
    nextCardButton.disabled = true;
});


// Get the New Game button
const newGameButton = document.getElementById("newGameButton");

// Ask the server to start a new game
newGameButton.addEventListener("click", () => {
    socket.emit("newGame");
});

// Reset the game display for everyone
socket.on("gameReset", () => {

    currentCard.textContent = "Waiting for the first card...";
    gameMessage.textContent = "";

    winnerSection.style.display = "none";
    winnerName.textContent = "";

    loteriaButton.disabled = false;
    nextCardButton.disabled = false;
});
