# Pixel Server - API & Socket Specification

This document provides the complete specification for integrating the Frontend (React/Phaser) with the Pixel Server.

## 1. REST API (Initialization)
**Base URL:** `http://localhost:3000/api/v1`

| Endpoint | Method | Description | Payload | Success Response (200) | Error Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/health` | `GET` | Check server status | N/A | `Pixel Server OK` | N/A |
| `/map` | `GET` | Get Tiled Map JSON | N/A | JSON Object (Tiled Map) | `500` |
| `/login` | `POST` | Login & Spawn | `{ "username": "string", "avatar": "string" }` | See below | `400` |

### **POST /login** Response
```json
{
  "userId": "uuid-string",
  "username": "Neo",
  "avatar": "hero-1",
  "spawn": {
    "x": 400,
    "y": 300
  }
}
```

---

## 2. WebSocket API (Real-time)
**Connection:** `io("http://localhost:3000")`

### **A. Initial Connection**
After connecting, you must join the game world.

#### Event: `join-room` (Client -> Server)
*   **Payload:**
    ```javascript
    {
      "username": "Neo",
      "avatar": "hero-1"
    }
    ```

#### Event: `current-users` (Server -> Client)
*   **Trigger:** Sent immediately after you join.
*   **Payload:** Dictionary of all players currently in the world.
    ```javascript
    {
      "socket-id-1": { "id": "...", "username": "...", "x": 0, "y": 0, "currentRoom": null },
      "socket-id-2": { ... }
    }
    ```

#### Event: `new-user-joined` (Server -> Client)
*   **Trigger:** Sent when *someone else* joins.
*   **Payload:** Single Player Object.

---

### **B. Movement & Zones**

#### Event: `player-move` (Client -> Server)
*   **Payload:**
    ```javascript
    {
      "x": 100,
      "y": 200,
      "direction": "left" // "left" | "right" | "up" | "down"
    }
    ```

#### Event: `player-moved` (Server -> Client)
*   **Trigger:** Someone else moved.
*   **Payload:** Updated Player Object.

#### Event: `room-changed` (Server -> Client)
*   **Trigger:** You walked into/out of a "Zone" (e.g. Meeting Room).
*   **Usage:** Use this to open/close Jitsi.
*   **Payload:**
    ```javascript
    {
      "entered": "meeting-room-1", // or null if walking into open space
      "left": null // name of room left
    }
    ```

---

### **C. Chat**

#### Event: `send-global-chat` (Client -> Server)
*   **Payload:** `{ "message": "Hello World" }`

#### Event: `receive-global-chat` (Server -> Client)
*   **Payload:** `ChatMessage` Object.

#### Event: `send-private-dm` (Client -> Server)
*   **Payload:** `{ "targetSocketId": "...", "message": "Secret" }`

#### Event: `receive-private-dm` (Server -> Client)
*   **Payload:** `ChatMessage` Object.

**ChatMessage Object Structure:**
```javascript
{
  "id": "uuid",
  "authorId": "...",
  "authorName": "...",
  "content": "Hello World",
  "timestamp": 1234567890,
  "type": "global" // or "private"
}
```

---

### **D. WebRTC (Video/Audio)**
Used for signaling between peers.

#### Event: `send-signal` (Client -> Server)
*   **Payload:**
    ```javascript
    {
      "targetSocketId": "...",
      "signal": { ... } // SimplePeer signal data
    }
    ```

#### Event: `receive-signal` (Server -> Client)
*   **Payload:**
    ```javascript
    {
      "fromUserId": "...",
      "signal": { ... }
    }
    ```

#### Event: `close-peer` (Client -> Server)
*   **Payload:** `{ "targetSocketId": "..." }`
