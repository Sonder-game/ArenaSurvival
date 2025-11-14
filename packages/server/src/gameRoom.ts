// packages/server/src/gameRoom.ts
import { Server } from "socket.io";
import { IGameState, IPlayerInput } from "@hero-survival/shared/src/types";

const TICK_RATE = 60; // Ticks per second
const TICK_INTERVAL = 1000 / TICK_RATE; // in milliseconds

export class GameRoom {
    private io: Server;
    private gameState: IGameState = {
        players: {},
        enemies: {},
    };
    private gameLoop: NodeJS.Timeout | null = null;
    private waveCount = 0;

    constructor(io: Server) {
        this.io = io;
    }

    addPlayer(id: string) {
        this.gameState.players[id] = {
            id,
            position: { x: 0, y: 0, z: 0 },
            hp: 100,
        };

        if (Object.keys(this.gameState.players).length === 1) {
            this.startGameLoop();
            this.startNextWave();
        }
    }

    removePlayer(id: string) {
        delete this.gameState.players[id];
        if (Object.keys(this.gameState.players).length === 0) {
            this.stopGameLoop();
            this.waveCount = 0;
            this.gameState.enemies = {};
        }
    }

    handlePlayerInput(id: string, input: IPlayerInput) {
        const player = this.gameState.players[id];
        if (player) {
            const speed = 0.1;
            if (input.up) player.position.z += speed;
            if (input.down) player.position.z -= speed;
            if (input.left) player.position.x -= speed;
            if (input.right) player.position.x += speed;
        }
    }

    private startGameLoop() {
        if (this.gameLoop) return;
        this.gameLoop = setInterval(() => {
            this.update();
            this.io.emit("gameState", this.gameState);
        }, TICK_INTERVAL);
    }

    private stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    private startNextWave() {
        this.waveCount++;
        // Spawn 3 enemies for the first wave
        for (let i = 0; i < 3; i++) {
            const id = `enemy-${this.waveCount}-${i}`;
            this.gameState.enemies[id] = {
                id,
                position: { x: Math.random() * 10 - 5, y: 0, z: Math.random() * 10 - 5 },
                hp: 50,
            };
        }
    }

    private update() {
        // Basic AI: Move enemies towards the first player
        const playerArray = Object.values(this.gameState.players);
        if (playerArray.length > 0) {
            const firstPlayer = playerArray[0];

            for (const enemyId in this.gameState.enemies) {
                const enemy = this.gameState.enemies[enemyId];
                const dx = firstPlayer.position.x - enemy.position.x;
                const dz = firstPlayer.position.z - enemy.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);

                const speed = 0.02;
                if (distance > 1) { // Stop when close to the player
                    enemy.position.x += (dx / distance) * speed;
                    enemy.position.z += (dz / distance) * speed;
                }
            }
        }
    }
}
