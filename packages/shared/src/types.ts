// packages/shared/src/types.ts

export interface IVector3 {
    x: number;
    y: number;
    z: number;
}

export interface IEntity {
    id: string;
    position: IVector3;
}

export interface IPlayer extends IEntity {
    hp: number;
}

export interface IEnemy extends IEntity {
    hp: number;
}

export interface IGameState {
    players: Record<string, IPlayer>;
    enemies: Record<string, IEnemy>;
}

export interface IPlayerInput {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
}
