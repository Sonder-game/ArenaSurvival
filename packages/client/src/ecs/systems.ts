import { queryEntities } from '@skyboxgg/bjs-ecs';
import { Scene, TransformNode, Vector3, PointerEventTypes } from '@babylonjs/core';
import {
    Rotator,
    VelocityComponent,
    CollidableComponent,
    HealthComponent,
    DamageComponent
} from './components';
import { createProjectile } from './factories';

type RotatableEntity = TransformNode & {
    rotator: { speed: number };
};

export const RotationSystem = (deltaTime: number) => {
    const entities = queryEntities([TransformNode, Rotator]) as RotatableEntity[];

    for (const entity of entities) {
        entity.rotation.y += entity.rotator.speed * deltaTime;
    }
};

type MovableEntity = TransformNode & {
    velocity: ReturnType<typeof VelocityComponent.create>;
};

type HealthEntity = TransformNode & {
    health: ReturnType<typeof HealthComponent.create>;
};

type ProjectileEntity = TransformNode & {
    collidable: ReturnType<typeof CollidableComponent.create>;
    damage: ReturnType<typeof DamageComponent.create>;
};

type EnemyEntity = TransformNode & {
    collidable: ReturnType<typeof CollidableComponent.create>;
    health: ReturnType<typeof HealthComponent.create>;
};

export const MovementSystem = (deltaTime: number) => {
    const entities = queryEntities([TransformNode, VelocityComponent]) as MovableEntity[];

    for (const entity of entities) {
        const velocityVector = entity.velocity.direction.scale(entity.velocity.speed * deltaTime);
        entity.position.addInPlace(velocityVector);
    }
};

export const CollisionSystem = () => {
    const projectiles = queryEntities([TransformNode, CollidableComponent, DamageComponent]) as ProjectileEntity[];
    const enemies = queryEntities([TransformNode, CollidableComponent, HealthComponent]) as EnemyEntity[];

    for (const projectile of projectiles.filter(p => p.collidable.type === 'projectile')) {
        for (const enemy of enemies.filter(e => e.collidable.type === 'enemy')) {
            if (!projectile.isDisposed() && !enemy.isDisposed()) {
                const distance = Vector3.Distance(projectile.position, enemy.position);
                if (distance < projectile.collidable.size + enemy.collidable.size) {
                    enemy.health.currentHealth -= projectile.damage.damage;
                    console.log(`Enemy hit! Health: ${enemy.health.currentHealth}`);
                    projectile.dispose();
                }
            }
        }
    }
};

export const DeathSystem = () => {
    const entities = queryEntities([TransformNode, HealthComponent]) as HealthEntity[];

    for (const entity of entities) {
        if (entity.health.currentHealth <= 0) {
            console.log('Entity has died.');
            entity.dispose();
        }
    }
};

export const createPlayerInputSystem = (scene: Scene, getPlayer: () => TransformNode | null) => {
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
            const player = getPlayer();
            if (!player) return;

            const pickResult = scene.pick(scene.pointerX, scene.pointerY);

            if (pickResult.hit && pickResult.pickedPoint) {
                const targetPoint = pickResult.pickedPoint;
                const direction = targetPoint.subtract(player.position).normalize();

                const spawnPos = player.position.clone().add(direction.scale(1.5));
                createProjectile(spawnPos, direction, scene);
            }
        }
    });
};
