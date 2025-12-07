# WebSocket Testing Guide

Since WebSockets are real-time and event-based, you can't easily use `curl`. We have provided a test script to simulate a client.

## Option 1: Using the Test Script
1.  Ensure the server is running (`npm run dev`).
2.  Open a new terminal.
3.  Run the test script:
    ```bash
    node scripts/test_socket.js
    ```

### Expected Output
```text
Connecting as Tester_123...
✅ Connected to server! ID: ...
🔹 Emitting join-room...
✅ Received current-users (1 players)
🔹 Emitting player-move (walking into Meeting Room)...
✅ Received room-changed: { entered: 'meeting-room-1', left: null }
🎉 SUCCESS: Zone detection working!
```

## Option 2: Using Postman (WebSocket Request)
1.  Open Postman -> New -> **WebSocket Request**.
2.  Enter URL: `ws://localhost:3000`.
3.  Click **Connect**.
4.  In the "Message" tab, you need to manually send Socket.io handshake (Socket.io is complex in raw Postman, sticking to Option 1 is recommended).
    *   *Note: Standard WebSocket connections won't work perfectly because we use Socket.io library logic.*

## Option 3: Using Firecamp / Socket.io Admin UI
If you want a GUI, use a tool specifically for Socket.io like **Firecamp** or **Postman (Socket.io mode)**.
1.  Select **Socket.io** as the type (not Raw WebSocket).
2.  Connect to `http://localhost:3000`.
3.  add Listeners: `current-users`, `room-changed`.
4.  Emit Event `join-room` with JSON body:
    ```json
    { "username": "Tester", "avatar": "hero-1" }
    ```
