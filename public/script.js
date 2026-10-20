
// This will be the code that connects the players
// to the server

// Connect to our Socket.IO server
const socket = io();

// Get the HTML elements
const joinButton = document.getElementById("joinButton");
const playerName = document.getElementById("playerName");
const joinSection = document.getElementById("joinSection");
const lobbySection = document.getElementById("lobbySection");
const playerCount = document.getElementById("playerCount");
const playerList = document.getElementById("playerList");

// Get the host controls and called card elements
const hostControls = document.getElementById("hostControls");
const nextCardButton = document.getElementById("nextCardButton");
const currentCard = document.getElementById("currentCard");
const gameMessage = document.getElementById("gameMessage");

// Get the winning pattern elements
const winningPatternSelect = document.getElementById("winningPattern");
const selectedPattern = document.getElementById("selectedPattern");

// Get the Loteria button and winner elements
const loteriaButton = document.getElementById("loteriaButton");
const winnerSection = document.getElementById("winnerSection");
const winnerName = document.getElementById("winnerName");

// Get the New Game button
const newGameButton = document.getElementById("newGameButton");


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

        // Create an image for this Loteria card
        const cardImage = document.createElement("img");
        cardImage.src = card.image;
        cardImage.alt = card.name;
        cardImage.className = "loteriaImage";

        // Show the emoji if the image cannot load
        cardImage.onerror = () => {
            cardImage.replaceWith(
                document.createTextNode(card.emoji)
            );
        };

        // Add the image to the card
        cardElement.appendChild(cardImage);

        // Add the card to the board
        gameBoard.appendChild(cardElement);
    });
});


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

    // Clear the previous called card
    currentCard.textContent = "";

    // Lock the winning pattern once the game starts
    winningPatternSelect.disabled = true;

    // Create the called card's illustration
    const calledImage = document.createElement("img");
    calledImage.src = card.image;
    calledImage.alt = card.name;
    calledImage.className = "calledCardImage";

    // Show the emoji and name if the image cannot load
    calledImage.onerror = () => {
        currentCard.textContent = card.emoji + " " + card.name;
    };

    // Display the illustration
    currentCard.appendChild(calledImage);
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
        const isMarked = markedCards.includes(
            card.dataset.cardName
        );

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

    // Disable the host's Next Card button
    nextCardButton.disabled = true;

    // Keep the winning pattern locked
    winningPatternSelect.disabled = true;
});


// Ask the server to start a new game
newGameButton.addEventListener("click", () => {
    socket.emit("newGame");
});


// Reset the game display for everyone
socket.on("gameReset", () => {

    // Allow the host to choose a new winning pattern
    winningPatternSelect.disabled = false;

    // Clear the previously called card
    currentCard.textContent = "Waiting for the first card...";

    // Clear any previous messages
    gameMessage.textContent = "";

    // Hide the previous winner
    winnerSection.style.display = "none";
    winnerName.textContent = "";

    // Enable the game buttons again
    loteriaButton.disabled = false;
    nextCardButton.disabled = false;
});


// When the host selects a winning pattern
winningPatternSelect.addEventListener("change", () => {

    // Send the selected pattern to the server
    socket.emit("selectPattern", winningPatternSelect.value);
});


// When the server updates the winning pattern
socket.on("patternUpdated", (pattern) => {

    // Names to display for each winning pattern
    const patternNames = {
        any: "Any Line (First to Complete)",
        horizontal: "Horizontal Row",
        vertical: "Vertical Column",
        diagonal: "Diagonal Line",
        full: "Full Board"
    };

    // Display the selected pattern to everyone
    selectedPattern.textContent = patternNames[pattern];

    // Keep the host's dropdown synchronized
    winningPatternSelect.value = pattern;
});
