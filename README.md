# Proximity Backend

This is the backend server for the Proximity project, built with Express and Socket.io.

## Prerequisites

- Node.js (v14+ recommended)
- npm

## Setup

1.  Open this directory in your terminal:
    ```bash
    cd "d:\Code\project\proximity backend"
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Running the Server

### Development Mode (with hot-reload)
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## API Endpoints

-   `GET /api/room-info`: Returns map configuration.
-   `http://localhost:3000/maps/main-office.json`: Serves the map JSON file.

## Socket Events

-   `join-room`: Client -> Server (Join game)
-   `player-move`: Client -> Server (Movement updates)
-   `send-global-chat`: Client -> Server (Global chat)
-   `send-private-dm`: Client -> Server (Direct messages)
-   `send-signal`: Client -> Server (WebRTC signaling)
