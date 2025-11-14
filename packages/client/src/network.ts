// packages/client/src/network.ts
import { io, Socket } from "socket.io-client";
import { IGameState, IPlayerInput } from "@hero-survival/shared/src/types";

export class Network {
    public socket: Socket;

    constructor(serverUrl: string) {
        this.socket = io(serverUrl);

        this.socket.on("connect", () => {
            console.log("Connected to server with id:", this.socket.id);
        });
    }

    sendPlayerInput(input: IPlayerInput) {
        this.socket.emit("playerInput", input);
    }

    onGameState(callback: (gameState: IGameState) => void) {
        this.socket.on("gameState", callback);
    }
}
