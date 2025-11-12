import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import type { ClientMessage, ServerMessage } from '@hero-survival/shared';

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        try {
            const data: ClientMessage = JSON.parse(message.toString());

            if (data.type === 'ping') {
                console.log('Received ping:', data.payload);
                const response: ServerMessage = {
                    type: 'pong',
                    payload: `Server received "${data.payload}"`,
                };
                ws.send(JSON.stringify(response));
            }
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const port = 8080;
server.listen(port, () => {
    console.log(`WebSocket server is running on ws://localhost:${port}`);
});
