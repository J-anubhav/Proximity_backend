# Pixel Server - Frontend Integration Guide 📘

**To the Frontend Developer:**
This document is the **Single Source of Truth** for integrating with the Pixel Server.
If you have questions about payloads, events, or flows, **check this document first.**

---

## 🛠️ Quick Self-Check
Before debugging your React/Phaser code, verify the server is working by using the **Built-in Test Dashboard**.
1.  Ensure backend is running: `npm run dev`
2.  Open **[http://localhost:3000/test.html](http://localhost:3000/test.html)**
3.  Click **Connect** -> **Join** -> **Move**.
    *   *If this works, the Backend is fine. The issue is likely in your client code.*

---

## 1. REST API (Initialization)
**Base URL:** `http://localhost:3000/api/v1`

| Endpoint | Method | Payload | Success (200) | Error |
| :--- | :--- | :--- | :--- | :--- |
| `/login` | `POST` | `{"username": "Neo", "avatar": "hero-1"}` | `{ "userId": "uuid", "spawn": { "x": 400, "y": 300 } }` | `400` |
| `/map` | `GET` | N/A | **Tiled JSON** (Objects under `layers` -> `name: "Zones"`) | `500` |

---

## 2. WebSocket API (Real-time)
*   **Library:** `socket.io-client` (v4.x)
*   **URL:** `http://localhost:3000`
*   **Transports:** `websocket`, `polling`

### 🔄 Connection Flow
1.  **Connect**: `const socket = io('http://localhost:3000');`
2.  **Join**: Emit `join-room`.
3.  **Listen**: For `current-users` to populate the world.

### 📡 Events Cheat Sheet

#### Client -> Server (You Emit These)
| Event | Payload Structure | Notes |
| :--- | :--- | :--- |
| `join-room` | `{ "username": "string", "avatar": "string" }` | Call this immediately after connect. |
| `player-move` | `{ "x": number, "y": number, "direction": "string" }` | Send this on every frame/tick if moving. |
| `send-global-chat`| `{ "message": "string" }` | |
| `send-private-dm` | `{ "targetSocketId": "uuid", "message": "string" }` | |
| `send-signal` | `{ "targetSocketId": "uuid", "signal": any }` | **WebRTC**: Forwarding SDP offers/answers. |
| `close-peer` | `{ "targetSocketId": "uuid" }` | **WebRTC**: End call. |

#### Server -> Client (You Listen For These)
| Event | Payload Structure | Action Required |
| :--- | :--- | :--- |
| `current-users` | `{ "socketId": PlayerObject, ... }` | Instantiate all existing characters. |
| `new-user-joined` | `PlayerObject` | Spawn a new character. |
| `player-moved` | `PlayerObject` | Tween/Lerp character to new `x,y`. |
| `user-left` | `"socketId"` | Destroy character sprite. |
| `room-changed` | `{ "entered": "room-name" \| null, "left": ... }` | **CRITICAL**: If `entered` is not null, **Open Jitsi**. |
| `receive-signal` | `{ "fromUserId": "...", "signal": ... }` | **WebRTC**: Pass `signal` to `simple-peer`. |

---

## 📦 Data Structures (TypeScript Interfaces)

### `PlayerObject`
```typescript
{
  id: string;          // Socket ID
  username: string;
  avatar: string;      // e.g. "hero-1"
  x: number;
  y: number;
  direction: string;   // "left", "right", "up", "down"
  isMoving: boolean;
  currentRoom: string | null; // "meeting-room-1" or null
}
```

### `ChatMessage`
```typescript
{
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  type: "global" | "private";
}
```

### `WebRTCSignal`
```typescript
{
  fromUserId: string;
  signal: any; // SDP Object from SimplePeer/WebRTC
}
```
