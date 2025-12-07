# Testing WebRTC Signaling in Bruno

To test the "Signal Pipe" (Client A receiving data from Client B), you need **Two Tabs** open in Bruno to simulate two different players.

## Prerequisites
Make sure your Bruno version supports **Socket.IO** (Beta feature in some versions, or use "WebSocket" with Socket.IO logic if supported). If Bruno feels clunky for this, "Firecamp" is often better for specific Socket.IO testing.

However, here is the flow for Bruno:

## Step 1: Connect Client A
1.  Open Bruno.
2.  Create a New Request -> Type: **Socket.IO** (or WebSocket).
3.  URL: `http://localhost:3000`.
4.  **Events to Listen to**:
    *   `connect`
    *   `receive-signal`
5.  **Connect**.
6.  Look at the logs/response. You need your **Socket ID**.
    *   *Tip:* If you can't see your ID easily, emit `join-room` with `{ "username": "A" }` and look at the server console log (`Player joined: SCK_ID...`).
    *   **Copy this ID** (e.g., `ZsD_77tg...`).

## Step 2: Connect Client B
1.  Open a **New Tab** in Bruno (Do not close Tab A).
2.  Type: **Socket.IO**.
3.  URL: `http://localhost:3000`.
4.  **Connect**.
5.  **Emit Message**:
    *   Event Name: `send-signal`
    *   JSON Body:
        ```json
        {
          "targetSocketId": "PASTE_CLIENT_A_ID_HERE",
          "signal": { "type": "offer", "sdp": "hello-from-bruno" }
        }
        ```
6.  Click **Send**.

## Step 3: Verify Result
1.  Go back to **Tab A**.
2.  Check the **Received Messages** / Logs.
3.  You should see an event `receive-signal` with the data:
    ```json
    {
      "fromUserId": "...",
      "signal": { "type": "offer", "sdp": "hello-from-bruno" }
    }
    ```

If you see this, the test is passed! 🎯
