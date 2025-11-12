// packages/server/src/server.ts
import { createServer } from "http";
import { Server } from "socket.io";
import { GameRoom } from "./gameRoom.js";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for simplicity in development
  },
});

const port = process.env.PORT || 3000;

const gameRoom = new GameRoom(io);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  gameRoom.addPlayer(socket.id);

  socket.on("playerInput", (input) => {
    gameRoom.handlePlayerInput(socket.id, input);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    gameRoom.removePlayer(socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
