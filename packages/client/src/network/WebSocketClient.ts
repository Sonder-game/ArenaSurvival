import type {
    ServerMessage,
    PlayerInputMessage,
    Vector2,
    GameState,
} from '@hero-survival/shared';

export class WebSocketClient {
    private socket: WebSocket;
    public onGameStateUpdate?: (gameState: GameState) => void;
    public onPlayerConnect?: (playerId: string) => void;

    constructor(url: string) {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log('WebSocket connection established');
        };

        this.socket.onmessage = (event) => {
            try {
                const message: ServerMessage = JSON.parse(event.data);

                if (message.type === 'gameStateUpdate') {
                    if (this.onGameStateUpdate) {
                        this.onGameStateUpdate(message.payload);
                    }
                } else if (message.type === 'playerConnect') {
                    if (this.onPlayerConnect) {
                        this.onPlayerConnect(message.payload.playerId);
                    }
                }
            } catch (error) {
                console.error('Error parsing server message:', error);
            }
        };

        this.socket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    public sendPlayerInput(direction: Vector2) {
        if (this.socket.readyState === WebSocket.OPEN) {
            const message: PlayerInputMessage = {
                type: 'playerInput',
                payload: { direction },
            };
            this.socket.send(JSON.stringify(message));
        }
    }
}
