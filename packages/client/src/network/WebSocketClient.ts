import type { ClientMessage, ServerMessage } from '@hero-survival/shared';

export class WebSocketClient {
    private socket: WebSocket;

    constructor(url: string) {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log('WebSocket connection established');
            const message: ClientMessage = {
                type: 'ping',
                payload: 'Hello from client!',
            };
            this.sendMessage(message);
        };

        this.socket.onmessage = (event) => {
            try {
                const message: ServerMessage = JSON.parse(event.data);
                if (message.type === 'pong') {
                    console.log('Received pong:', message.payload);
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

    public sendMessage(message: ClientMessage) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not open. Ready state:', this.socket.readyState);
        }
    }
}
