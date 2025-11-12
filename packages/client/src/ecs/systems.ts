import { createSystem, queryEntities, IWorld } from '@skyboxgg/bjs-ecs';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Rotator } from './components';

export const RotationSystem = createSystem(
    (world: IWorld) => {
        const entities = queryEntities(world, [TransformNode, Rotator]);

        return (deltaTime: number) => {
            for (const entity of entities) {
                const transform = entity.get(TransformNode);
                const rotator = entity.get(Rotator);
                if (transform && rotator) {
                    transform.rotation.y += rotator.speed * deltaTime;
                }
            }
        };
    }
);
