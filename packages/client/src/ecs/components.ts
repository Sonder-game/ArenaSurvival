import { createComponent } from '@skyboxgg/bjs-ecs';

export const Rotator = createComponent('rotator', (speed: number) => ({ speed }));
