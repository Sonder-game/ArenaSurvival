import { World } from '@skyboxgg/bjs-ecs';
import { MeshBuilder, Vector3, StandardMaterial, Color3 } from '@babylonjs/core';
import {
    HealthComponent,
    DamageComponent,
    VelocityComponent,
    CollidableComponent,
    EnemyComponent,
    ProjectileComponent
} from './components';

export const createEnemy = (position: Vector3, world: World) => {
    const scene = world.getScene();
    if (!scene) return null;

    const enemy = MeshBuilder.CreateBox('enemy', { size: 1 }, scene);
    enemy.position = position;
    const material = new StandardMaterial("enemyMat", scene);
    material.diffuseColor = new Color3(1, 0, 0); // Red
    enemy.material = material;

    world.createEntity(
        enemy,
        HealthComponent.create(100, 100),
        CollidableComponent.create('enemy', 0.5),
        EnemyComponent.create()
    );

    return enemy;
};

export const createProjectile = (position: Vector3, direction: Vector3, world: World) => {
    const scene = world.getScene();
    if (!scene) return null;

    const projectile = MeshBuilder.CreateSphere('projectile', { diameter: 0.2 }, scene);
    projectile.position = position;
    const material = new StandardMaterial("projMat", scene);
    material.diffuseColor = new Color3(0, 1, 0); // Green
    projectile.material = material;

    world.createEntity(
        projectile,
        DamageComponent.create(10),
        VelocityComponent.create(direction, 50), // Speed of 50
        CollidableComponent.create('projectile', 0.1),
        ProjectileComponent.create()
    );

    return projectile;
};
