// packages/client/src/scene.ts
import { Scene } from "@babylonjs/core/scene";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Culling/ray";


export function createScene(engine: Engine, canvas: HTMLCanvasElement) {
    const scene = new Scene(engine);

    // Light
    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Camera
    const camera = new ArcRotateCamera("camera1", -Math.PI / 2, Math.PI / 4, 20, new Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    // Ground
    MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);

    return scene;
}
