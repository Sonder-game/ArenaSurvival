import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { MeshBuilder, TransformNode } from '@babylonjs/core';
import '@babylonjs/core/Meshes/meshBuilder';
import '@babylonjs/core/Materials/standardMaterial';
import { World } from '@skyboxgg/bjs-ecs';

import { WebSocketClient } from './network/WebSocketClient';
import {
    MovementSystem,
    CollisionSystem,
    DeathSystem,
    createPlayerInputSystem
} from './ecs/systems';
import { createEnemy } from './ecs/factories';
import { CollidableComponent } from './ecs/components';

export class Game {
    private engine: Engine;
    private scene: Scene;
    private world: World;
    private wsClient: WebSocketClient;
    private player: TransformNode | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas, true);
        this.scene = new Scene(this.engine);
        this.world = new World(this.scene);

        const camera = new FreeCamera('camera1', new Vector3(0, 10, -20), this.scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);
        new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);
        
        // Создаем землю
        MeshBuilder.CreateGround("ground", {width: 50, height: 50}, this.scene);

        // Создаем игрока
        const playerSphere = MeshBuilder.CreateSphere('player', { diameter: 1 }, this.scene);
        playerSphere.position.y = 0.5;
        this.player = playerSphere;
        this.world.createEntity(
            this.player,
            CollidableComponent.create('player', 0.5)
        );

        // Создаем врага
        createEnemy(new Vector3(5, 0.5, 5), this.world);

        // Инициализируем систему ввода
        createPlayerInputSystem(this.scene, this.world, () => this.player);

        this.wsClient = new WebSocketClient('ws://localhost:8080');
        
        this.engine.runRenderLoop(() => {
            const deltaTime = this.engine.getDeltaTime() / 1000.0;

            // Вызываем системы в правильном порядке
            MovementSystem(deltaTime);
            CollisionSystem();
            DeathSystem();

            this.scene.render();
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
}
