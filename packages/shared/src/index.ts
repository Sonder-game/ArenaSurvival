// =================================================================================================
// DTO - Data Transfer Objects
// Эти типы описывают состояние игровых объектов.
// =================================================================================================

export type Vector2 = {
    x: number;
    y: number;
};

export type PlayerState = {
    id: string;
    position: Vector2;
};

export type EnemyState = {
    id: string;
    position: Vector2;
};

export type GameState = {
    players: PlayerState[];
    enemies: EnemyState[];
};

// =================================================================================================
// Network Messages
// Эти типы описывают сообщения, которыми обмениваются клиент и сервер.
// =================================================================================================

// Сообщения от клиента к серверу
export type PlayerInputMessage = {
    type: 'playerInput';
    payload: {
        direction: Vector2;
    };
};

export type ClientMessage = PlayerInputMessage;

// Сообщения от сервера к клиенту
export type GameStateUpdateMessage = {
    type: 'gameStateUpdate';
    payload: GameState;
};

export type PlayerConnectMessage = {
    type: 'playerConnect';
    payload: {
        playerId: string;
    };
};

export type ServerMessage = GameStateUpdateMessage | PlayerConnectMessage;
