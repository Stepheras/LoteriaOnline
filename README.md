# Lotería Online 🎴

## Project Description

Lotería Online is a real-time multiplayer web application inspired by the traditional Mexican game of Lotería. The application allows multiple players to join the same game from different devices, receive their own randomized Lotería boards, and compete to complete a winning pattern.

The game uses WebSockets through Socket.IO so that all connected players can see called cards, player updates, scores, and winning announcements in real time without refreshing their browsers.

## Live Website

**Play the game:** https://online-loteria.onrender.com/

## Technologies Used

- **HTML** – Structures the game interface.
- **CSS** – Styles the game with traditional Lotería-inspired colors and illustrated cards.
- **JavaScript** – Handles player interactions and updates the game interface.
- **Node.js** – Runs the backend server.
- **Express.js** – Serves the web application.
- **Socket.IO** – Provides real-time communication between players and the server.
- **Render** – Hosts the application online.
- **GitHub** – Stores the project's source code.

## Game Features

- Players can join the game by entering their names.
- Each player receives a unique randomized 4×4 Lotería board.
- The game includes 24 traditional-style illustrated Lotería cards.
- One player acts as the host and controls when the next card is called.
- All players see the same called card in real time.
- Players can mark and unmark cards that have already been called.
- A live leaderboard displays each player's number of marked cards.
- The host can select from five winning patterns:
  - Any completed line
  - Horizontal row
  - Vertical column
  - Diagonal line
  - Full board
- Players can click the **¡LOTERÍA!** button to claim a win.
- The server verifies whether the selected winning pattern has been completed.
- When a player wins, the winner is announced to everyone.
- The host can start a new game, generating new boards for all connected players.
- If the host disconnects, another connected player automatically becomes the host.
- The game can be played across different devices, including computers and phones.

## How to Play

1. Open the live website.
2. Enter your name and click **Join Game**.
3. Wait for other players to join.
4. The host selects the winning pattern.
5. The host clicks **Next Card** to call a random card.
6. If the called card appears on your board, click it to place a bean.
7. Continue until you complete the selected winning pattern.
8. Click **¡LOTERÍA!** to claim your win.
9. The server checks the board and announces the winner if the claim is valid.
10. The host can click **New Game** to start another round.

## How to Run Locally

Make sure Node.js and npm are installed.

Clone the repository:

```bash
git clone https://github.com/Stepheras/LoteriaOnline.git
```

Open the project folder:

```bash
cd LoteriaOnline
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Open your browser and visit:

http://localhost:3000

To simulate multiple players, open the game in separate browser tabs or on different devices connected to the application.

## WebSocket Implementation

The application uses Socket.IO to maintain real-time communication between the server and connected players.

When a player joins, calls a card, marks a card, or claims a win, the browser sends an event to the server. The server processes the action and sends updates to the appropriate players.

For example, when the host calls a card, the server selects a random card that has not been called and broadcasts it to all connected players. Everyone sees the same card without refreshing the page.

The server also manages player connections and automatically transfers host privileges if the current host disconnects.

## Testing

The game was tested using a Mac computer and a mobile phone. Testing included:

- Joining from multiple devices.
- Receiving different randomized boards.
- Displaying called cards across connected devices.
- Marking cards and updating the leaderboard.
- Testing the five winning patterns.
- Announcing winners and starting new games.
- Transferring host privileges when the original host disconnects.

## Current Limitations

- Game information is stored in server memory, so restarting the server resets the game.
- Players who refresh or disconnect must rejoin the game.
- The application uses a single shared game room rather than multiple separate rooms.
- The application is hosted using Render's free service, so the website may take a little longer to load after being inactive.

## Future Improvements

Possible improvements include adding multiple game rooms, allowing players to reconnect to an existing session, adding sound effects when cards are called, and storing game information in a database.

## Source Code

GitHub Repository: https://github.com/Stepheras/LoteriaOnline
