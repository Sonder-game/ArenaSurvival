import { createComponent } from '@skyboxgg/bjs-ecs';
import { Vector3 } from '@babylonjs/core';

export const Rotator = createComponent('rotator', (speed: number) => ({ speed }));

export const HealthComponent = createComponent('health', (currentHealth: number, maxHealth: number) => ({ currentHealth, maxHealth }));

export const DamageComponent = createComponent('damage', (damage: number) => ({ damage }));

export const VelocityComponent = createComponent('velocity', (direction: Vector3, speed: number) => ({ direction, speed }));

export const CollidableComponent = createComponent('collidable', (type: 'enemy' | 'projectile' | 'player', size: number) => ({ type, size }));

export const EnemyComponent = createComponent('enemy');

export const ProjectileComponent = createComponent('projectile');
