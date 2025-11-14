import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import type {
    ClientMessage,
    GameState,
    PlayerState,
    ServerMessage,
    Vector2,
} from '@hero-survival/shared';

// =================================================================================================
// Constants
// =================================================================================================

const PORT = 8080;
const TICK_RATE = 60; // Game state updates per second
const BROADCAST_RATE = 20; // Broadcasts to clients per second
const PLAYER_SPEED = 200; // Pixels per second
const ENEMY_SPEED = 100; // Pixels per second
const ENEMY_SPAWN_INTERVAL = 3000; // Milliseconds

// =================================================================================================
// Game State
// =================================================================================================

const gameState: GameState = {
    players: [],
    enemies: [],
};

const playerInputs = new Map<string, Vector2>();

// =================================================================================================
// Server Setup
// =================================================================================================

const server = createServer();
const wss = new WebSocketServer({ server });
const clients = new Map<string, WebSocket>();

wss.on('connection', (ws) => {
    const playerId = uuidv4();
    console.log(`Client connected: ${playerId}`);
    clients.set(playerId, ws);

    const newPlayer: PlayerState = {
        id: playerId,
        position: { x: 0, y: 0 }, // Start at the center
    };
    gameState.players.push(newPlayer);
    playerInputs.set(playerId, { x: 0, y: 0 });

    // Send the player their ID
    const connectMessage: ServerMessage = {
        type: 'playerConnect',
        payload: { playerId },
    };
    ws.send(JSON.stringify(connectMessage));

    ws.on('message', (message) => {
        try {
            const data: ClientMessage = JSON.parse(message.toString());

            if (data.type === 'playerInput') {
                playerInputs.set(playerId, data.payload.direction);
            }
        } catch (error) {
            console.error(`Failed to parse message from ${playerId}:`, error);
        }
    });

    ws.on('close', () => {
        console.log(`Client disconnected: ${playerId}`);
        clients.delete(playerId);
        playerInputs.delete(playerId);
        gameState.players = gameState.players.filter((p) => p.id !== playerId);
    });
});

// =================================================================================================
// Game Logic
// =================================================================================================

function update(deltaTime: number) {
    // Update player positions based on input
    for (const player of gameState.players) {
        const input = playerInputs.get(player.id);
        if (input) {
            player.position.x += input.x * PLAYER_SPEED * deltaTime;
            player.position.y += input.y * PLAYER_SPEED * deltaTime;
        }
    }

    // Update enemy positions
    for (const enemy of gameState.enemies) {
        // Find the closest player
        let closestPlayer: PlayerState | null = null;
        let minDistance = Infinity;

        for (const player of gameState.players) {
            const distance = Math.sqrt(
                Math.pow(player.position.x - enemy.position.x, 2) +
                Math.pow(player.position.y - enemy.position.y, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                closestPlayer = player;
            }
        }

        // Move towards the closest player
        if (closestPlayer) {
            const dx = closestPlayer.position.x - enemy.position.x;
            const dy = closestPlayer.position.y - enemy.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 1) { // Avoid division by zero
                const moveX = (dx / distance) * ENEMY_SPEED * deltaTime;
                const moveY = (dy / distance) * ENEMY_SPEED * deltaTime;
                enemy.position.x += moveX;
                enemy.position.y += moveY;
            }
        }
    }
}

function spawnEnemy() {
    if (gameState.players.length === 0) return; // Don't spawn enemies if no players

    const enemyId = uuidv4();
    // Spawn enemies at a random position around the edge of the screen
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    switch (side) {
        case 0: // Top
            x = Math.random() * 1000 - 500;
            y = 500;
            break;
        case 1: // Bottom
            x = Math.random() * 1000 - 500;
            y = -500;
            break;
        case 2: // Left
            x = -500;
            y = Math.random() * 1000 - 500;
            break;
        case 3: // Right
            x = 500;
            y = Math.random() * 1000 - 500;
            break;
    }

    const newEnemy = {
        id: enemyId,
        position: { x, y },
    };
    gameState.enemies.push(newEnemy);
}

function broadcastGameState() {
    const message: ServerMessage = {
        type: 'gameStateUpdate',
        payload: gameState,
    };
    const serializedMessage = JSON.stringify(message);

    for (const ws of clients.values()) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(serializedMessage);
        }
    }
}

// =================================================================================================
// Start Server and Game Loops
// =================================================================================================

server.listen(PORT, () => {
    console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});

const gameLoopInterval = 1000 / TICK_RATE;
let lastUpdateTime = Date.now();
setInterval(() => {
    const now = Date.now();
    const deltaTime = (now - lastUpdateTime) / 1000;
    update(deltaTime);
    lastUpdateTime = now;
}, gameLoopInterval);

setInterval(broadcastGameState, 1000 / BROADCAST_RATE);
setInterval(spawnEnemy, ENEMY_SPAWN_INTERVAL);
