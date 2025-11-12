// packages/client/src/main.ts
import { Engine } from "@babylonjs/core/Engines/engine";
import { createScene } from "./scene";
import { createPlayer, setupPlayerInput } from "./player";
import { Network } from "./network";
import { IGameState } from "@hero-survival/shared/src/types";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    const engine = new Engine(canvas, true);
    const scene = createScene(engine, canvas);

    const player = createPlayer(scene);
    const network = new Network('http://localhost:3000');

    setupPlayerInput(scene, (input) => {
        network.sendPlayerInput(input);
    });

    const entities: { [id: string]: any } = {};
    entities[player.id] = player;


    network.onGameState((gameState: IGameState) => {
        // Update players
        for (const playerId in gameState.players) {
            if (playerId === network.socket.id) {
                 // Server reconciliation for the local player would go here
                 const serverPlayer = gameState.players[playerId];
                 player.position.x = serverPlayer.position.x;
                 player.position.z = serverPlayer.position.z;
            } else if (entities[playerId]) {
                const serverPlayer = gameState.players[playerId];
                entities[playerId].position.x = serverPlayer.position.x;
                entities[playerId].position.z = serverPlayer.position.z;
            } else {
                // Create a new mesh for the other player
            }
        }

        // Update enemies
        for (const enemyId in gameState.enemies) {
            if (entities[enemyId]) {
                const serverEnemy = gameState.enemies[enemyId];
                entities[enemyId].position.x = serverEnemy.position.x;
                entities[enemyId].position.z = serverEnemy.position.z;
            } else {
                const newEnemy = MeshBuilder.CreateBox(enemyId, { size: 1 }, scene);
                newEnemy.id = enemyId;
                entities[enemyId] = newEnemy;
            }
        }

         // Remove disconnected entities
         const allIds = {...gameState.players, ...gameState.enemies};
         for (const entityId in entities) {
             if (!allIds[entityId] && entityId !== player.id) {
                 entities[entityId].dispose();
                 delete entities[entityId];
             }
         }
    });


    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener("resize", () => {
      engine.resize();
    });
});
