# Arena Survival MVP - Implementation Plan

This document outlines the step-by-step plan to develop the Minimum Viable Product (MVP) for the "Arena Survival" game. The goal is to implement a basic gameplay loop where a single player can join an arena, move around, and survive one wave of three enemies.

## 1. Environment Setup (Dependencies & Scripts)

### 1.1. `packages/client` Dependencies:
- **`@babylonjs/core`**: Already installed.
- **`@babylonjs/loaders`**: Add for potential future model loading.
- **`socket.io-client`**: Add for communication with the server.

### 1.2. `packages/server` Dependencies:
- **`socket.io`**: Add for real-time communication.
- **`typescript`**: Already installed.
- **`ts-node`**: Add for running TypeScript directly in development.

### 1.3. `packages/shared` Dependencies:
- No new dependencies needed for the MVP.

### 1.4. Root `package.json` Scripts:
- Modify the existing `dev` script to use `ts-node` for the server and ensure both client and server run concurrently.

```json
"scripts": {
  "dev": "pnpm --parallel dev",
  "build": "pnpm --parallel build"
}
```
- Add `dev` scripts to `packages/client/package.json` and `packages/server/package.json`

## 2. Package Structure (File Scaffolding)

### 2.1. `packages/client/src`:
- **`main.ts`**: Entry point for the client, initializes Babylon.js scene.
- **`scene.ts`**: Handles scene creation, lighting, and camera setup.
- **`player.ts`**: Manages player character creation, input, and movement.
- **`network.ts`**: Handles Socket.IO connection and communication.

### 2.2. `packages/server/src`:
- **`server.ts`**: Main server entry point, initializes Socket.IO.
- **`gameRoom.ts`**: Manages game state, player connections, and the game loop.

### 2.3. `packages/shared/src`:
- **`types.ts`**: Defines shared interfaces for game state, player input, and entities.

## 3. Server Implementation (MVP)

### 3.1. Basic Socket.io Server Setup (`server.ts`):
- Create an HTTP server and attach a Socket.IO instance.
- Listen for incoming connections.

### 3.2. Game Room Logic (`gameRoom.ts`):
- On a new client connection, create a `GameRoom` instance.
- Add the connected player to the room.
- Start the game loop when the first player joins.

### 3.3. Wave Logic (`gameRoom.ts`):
- Implement a simple wave system that spawns 3 mobs.
- Mobs will be represented by data objects with `id`, `position`, and `hp`.

### 3.4. Game Loop (`gameRoom.ts`):
- Use `setInterval` for the main game loop (e.g., every 16ms for ~60 FPS).
- Implement basic mob AI: move towards the player's position.
- Broadcast the updated `GameState` to all clients in the room on each tick.

## 4. Client Implementation (MVP)

### 4.1. Babylon.js Scene Initialization (`main.ts` & `scene.ts`):
- Create a canvas, engine, and scene.
- Set up a basic camera and lighting.
- Create a simple ground mesh for the arena.

### 4.2. Hero Creation (`player.ts`):
- Create a simple mesh (e.g., a cube or sphere) to represent the player.

### 4.3. Player Control (`player.ts`):
- Implement top-down movement using WASD keys.
- On each frame, check for input and update the player's position.

### 4.4. Network Logic (`network.ts`):
- Connect to the Socket.IO server.
- Send player input to the server on a regular interval.
- Receive `GameState` updates from the server.

### 4.5. Rendering Logic (`main.ts`):
- In the render loop, update the positions of the player and enemy meshes based on the received `GameState`.

## 5. Shared Package (`shared/src/types.ts`)

### 5.1. Key Interfaces:
- **`IEntity`**: A base interface for all game objects (players, enemies) with properties like `id`, `position`, `hp`.
- **`IGameState`**: Represents the state of the game at a given moment, containing a list of all entities.
- **`IPlayerInput`**: Represents the player's input (e.g., `{ up: boolean, down: boolean, left: boolean, right: boolean }`).
