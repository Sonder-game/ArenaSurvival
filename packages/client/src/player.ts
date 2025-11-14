// packages/client/src/player.ts
import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ActionManager, ExecuteCodeAction } from "@babylonjs/core/Actions";
import { IPlayerInput } from "@hero-survival/shared/src/types";

export function createPlayer(scene: Scene) {
    const player = MeshBuilder.CreateSphere("player", { diameter: 1 }, scene);
    player.position = new Vector3(0, 0.5, 0);
    return player;
}

export function setupPlayerInput(scene: Scene, networkCallback: (input: IPlayerInput) => void) {
    const input: IPlayerInput = {
        up: false,
        down: false,
        left: false,
        right: false
    };

    scene.actionManager = new ActionManager(scene);

    const keyMap = {
        "w": "up",
        "s": "down",
        "a": "left",
        "d": "right"
    };

    scene.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            const key = evt.sourceEvent.key;
            if (key in keyMap) {
                input[keyMap[key]] = true;
            }
        })
    );
     scene.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            const key = evt.sourceEvent.key;
            if (key in keyMap) {
                input[keyMap[key]] = false;
            }
        })
    );

    // Send input to server on a regular interval
    setInterval(() => {
        networkCallback(input);
    }, 1000 / 60); // 60 times per second
}
