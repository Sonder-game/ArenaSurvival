import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { GridMaterial } from '@babylonjs/materials/grid';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { GameState, Vector2 } from '@hero-survival/shared';

import { WebSocketClient } from './network/WebSocketClient';

export class Game {
    private engine: Engine;
    private scene: Scene;
    private wsClient: WebSocketClient;
    private myPlayerId: string | null = null;

    private players: Map<string, Mesh> = new Map();
    private enemies: Map<string, Mesh> = new Map();
    private input: Vector2 = { x: 0, y: 0 };
    private lastSentInput: Vector2 = { x: 0, y: 0 };

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas, true);
        this.scene = new Scene(this.engine);
        this.wsClient = new WebSocketClient('ws://localhost:8080');
        console.log('Game client started.');

        this.setupCamera(canvas);
        this.setupLight();
        this.createGround();
        this.handleInput();

        this.wsClient.onGameStateUpdate = (gameState) => {
            console.log('Received game state:', gameState);
            this.updateGameState(gameState);
        };
        
        this.wsClient.onPlayerConnect = (playerId) => {
            console.log('Player connected with ID:', playerId);
            this.myPlayerId = playerId;
        };

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    private setupCamera(canvas: HTMLCanvasElement): void {
        const camera = new FreeCamera('camera1', new Vector3(0, 50, -50), this.scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);
        console.log('Camera setup complete.');
    }

    private setupLight(): void {
        new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);
        console.log('Light setup complete.');
    }

    private createGround(): void {
        const ground = MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, this.scene);
        ground.material = new GridMaterial('groundMaterial', this.scene);
        console.log('Ground created.');
    }

    private handleInput(): void {
        const keyState = {
            KeyW: false,
            KeyA: false,
            KeyS: false,
            KeyD: false,
        };

        window.addEventListener('keydown', (e) => {
            if (e.code in keyState && !keyState[e.code as keyof typeof keyState]) {
                keyState[e.code as keyof typeof keyState] = true;
                this.updateInput(keyState);
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code in keyState && keyState[e.code as keyof typeof keyState]) {
                keyState[e.code as keyof typeof keyState] = false;
                this.updateInput(keyState);
            }
        });
    }

    private updateInput(keyState: { KeyW: boolean; KeyA: boolean; KeyS: boolean; KeyD: boolean }): void {
        let x = 0;
        let y = 0;

        if (keyState.KeyW) y = 1;
        if (keyState.KeyS) y = -1;
        if (keyState.KeyA) x = -1;
        if (keyState.KeyD) x = 1;

        const len = Math.sqrt(x * x + y * y);
        if (len > 0) {
            this.input.x = x / len;
            this.input.y = y / len;
        } else {
            this.input.x = 0;
            this.input.y = 0;
        }

        if (this.input.x !== this.lastSentInput.x || this.input.y !== this.lastSentInput.y) {
            this.wsClient.sendPlayerInput(this.input);
            this.lastSentInput.x = this.input.x;
            this.lastSentInput.y = this.input.y;
        }
    }

    private updateGameState(gameState: GameState): void {
        const currentPlayerIds = new Set(gameState.players.map(p => p.id));
        const currentEnemyIds = new Set(gameState.enemies.map(e => e.id));

        for (const [id, mesh] of this.players.entries()) {
            if (!currentPlayerIds.has(id)) {
                mesh.dispose();
                this.players.delete(id);
            }
        }

        for (const [id, mesh] of this.enemies.entries()) {
            if (!currentEnemyIds.has(id)) {
                mesh.dispose();
                this.enemies.delete(id);
            }
        }

        for (const playerState of gameState.players) {
            let playerMesh = this.players.get(playerState.id);
            if (!playerMesh) {
                playerMesh = MeshBuilder.CreateSphere(`player_${playerState.id}`, { diameter: 2 }, this.scene);
                this.players.set(playerState.id, playerMesh);

                if (playerState.id === this.myPlayerId) {
                    this.scene.activeCamera!.parent = playerMesh;
                }
            }
            playerMesh.position.x = playerState.position.x / 10;
            playerMesh.position.z = playerState.position.y / 10;
        }

        for (const enemyState of gameState.enemies) {
            let enemyMesh = this.enemies.get(enemyState.id);
            if (!enemyMesh) {
                enemyMesh = MeshBuilder.CreateBox(`enemy_${enemyState.id}`, { size: 1 }, this.scene);
                this.enemies.set(enemyState.id, enemyMesh);
            }
            enemyMesh.position.x = enemyState.position.x / 10;
            enemyMesh.position.z = enemyState.position.y / 10;
        }
    }
}
