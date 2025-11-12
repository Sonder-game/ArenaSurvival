import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import '@babylonjs/core/Meshes/meshBuilder';
import '@babylonjs/core/Materials/standardMaterial';
import { addEntity } from '@skyboxgg/bjs-ecs';

import { WebSocketClient } from './network/WebSocketClient';
import { Rotator } from './ecs/components';
import { RotationSystem } from './ecs/systems';

export class Game {
    private engine: Engine;
    private scene: Scene;
    private wsClient: WebSocketClient;

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas, true);
        this.scene = new Scene(this.engine);
        
        const camera = new FreeCamera('camera1', new Vector3(0, 5, -10), this.scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);
        new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);
        
        const box = MeshBuilder.CreateBox('box', { size: 2 }, this.scene);
        
        // Сущность создается передачей массива компонентов:
        // сам объект BabylonJS (box) и данные нашего компонента (Rotator).
        addEntity([
            box,
            Rotator(0.5) 
        ]);

        this.wsClient = new WebSocketClient('ws://localhost:8080');
        
        this.engine.runRenderLoop(() => {
            const deltaTime = this.engine.getDeltaTime() / 1000.0;
            RotationSystem(deltaTime);
            this.scene.render();
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
}