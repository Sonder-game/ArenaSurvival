import { addEntity } from '@skyboxgg/bjs-ecs';
import { Scene, MeshBuilder, Vector3, StandardMaterial, Color3 } from '@babylonjs/core';
import {
    HealthComponent,
    DamageComponent,
    VelocityComponent,
    CollidableComponent,
    EnemyComponent,
    ProjectileComponent
} from './components';

export const createEnemy = (position: Vector3, scene: Scene) => {
    if (!scene) return null;

    const enemy = MeshBuilder.CreateBox('enemy', { size: 1 }, scene);
    enemy.position = position;
    const material = new StandardMaterial("enemyMat", scene);
    material.diffuseColor = new Color3(1, 0, 0); // Red
    enemy.material = material;

    addEntity([
        enemy,
        HealthComponent(100, 100),
        CollidableComponent('enemy', 0.5),
        EnemyComponent()
    ]);

    return enemy;
};

export const createProjectile = (position: Vector3, direction: Vector3, scene: Scene) => {
    if (!scene) return null;

    const projectile = MeshBuilder.CreateSphere('projectile', { diameter: 0.2 }, scene);
    projectile.position = position;
    const material = new StandardMaterial("projMat", scene);
    material.diffuseColor = new Color3(0, 1, 0); // Green
    projectile.material = material;

    addEntity([
        projectile,
        DamageComponent(10),
        VelocityComponent(direction, 50),
        CollidableComponent('projectile', 0.1),
        ProjectileComponent()
    ]);

    return projectile;
};
