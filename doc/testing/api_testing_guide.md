# Proximity Backend API Testing Guide

## Base URL
```
http://localhost:3000/api/v1
```

## Test with cURL or Bruno/Postman

---

## 1. Health Check

### ✅ Success
```bash
curl http://localhost:3000/api/v1/health
```
**Response:** `Pixel Server OK`

---

## 2. Room Management

### 2.1 Create Room ✅
```bash
curl -X POST http://localhost:3000/api/v1/rooms/create \
  -H "Content-Type: application/json" \
  -d '{
    "username": "John",
    "avatar": "hero-1",
    "roomName": "My Office"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "675fd1234...",
  "username": "John",
  "avatar": "hero-1",
  "roomId": "675fd1234...",
  "roomCode": "ABC123",
  "roomName": "My Office",
  "isCreator": true,
  "expiresAt": "2024-12-18T02:00:00.000Z",
  "spawn": { "x": 420, "y": 315 }
}
```

**Error - Missing username (400):**
```json
{ "error": "Username must be at least 2 characters" }
```

**Error - Missing room name (400):**
```json
{ "error": "Room name is required" }
```

---

### 2.2 Join Room ✅
```bash
curl -X POST http://localhost:3000/api/v1/rooms/join \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Jane",
    "avatar": "hero-2",
    "roomCode": "ABC123"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "675fd5678...",
  "username": "Jane",
  "avatar": "hero-2",
  "roomId": "675fd1234...",
  "roomCode": "ABC123",
  "roomName": "My Office",
  "isCreator": false,
  "expiresAt": "2024-12-18T02:00:00.000Z",
  "spawn": { "x": 435, "y": 320 }
}
```

**Error - Invalid code format (400):**
```json
{ "error": "Invalid room code format" }
```

**Error - Room not found (404):**
```json
{ "error": "Room not found or expired" }
```

---

### 2.3 Rejoin Room (with token) ✅
```bash
curl -X POST http://localhost:3000/api/v1/rooms/rejoin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "success": true,
  "userId": "675fd1234...",
  "username": "John",
  "avatar": "hero-1",
  "roomId": "675fd1234...",
  "roomCode": "ABC123",
  "roomName": "My Office",
  "isCreator": true,
  "expiresAt": "2024-12-18T02:00:00.000Z",
  "spawn": { "x": 410, "y": 325 }
}
```

**Error - Invalid token (401):**
```json
{ "error": "Invalid or expired token" }
```

**Error - Room expired (404):**
```json
{ "error": "Room no longer exists or has expired" }
```

---

### 2.4 Abolish Room (creator only) ✅
```bash
curl -X POST http://localhost:3000/api/v1/rooms/abolish \
  -H "Authorization: Bearer CREATOR_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Room abolished successfully"
}
```

**Error - Not creator (403):**
```json
{ "error": "Only room creator can abolish the room" }
```

---

### 2.5 Get Room Details ✅
```bash
curl http://localhost:3000/api/v1/rooms/ROOM_ID_HERE
```

**Success Response (200):**
```json
{
  "roomId": "675fd1234...",
  "code": "ABC123",
  "name": "My Office",
  "creator": { "_id": "...", "username": "John", "avatar": "hero-1" },
  "createdAt": "2024-12-17T02:00:00.000Z",
  "expiresAt": "2024-12-18T02:00:00.000Z",
  "isActive": true,
  "users": [
    { "_id": "...", "username": "John", "avatar": "hero-1" },
    { "_id": "...", "username": "Jane", "avatar": "hero-2" }
  ]
}
```

---

## 3. Kanban Tasks

### 3.1 Get All Tasks ✅
```bash
curl http://localhost:3000/api/v1/rooms/ROOM_ID_HERE/tasks
```

**Success Response (200):**
```json
{
  "tasks": [
    {
      "_id": "675fd...",
      "roomId": "675fd...",
      "title": "Fix login bug",
      "description": "Users can't login",
      "status": "todo",
      "createdAt": "2024-12-17T02:00:00.000Z",
      "updatedAt": "2024-12-17T02:00:00.000Z"
    }
  ],
  "kanban": [
    { "key": "todo", "label": "To Do", "tasks": [...] },
    { "key": "inprogress", "label": "In Progress", "tasks": [] },
    { "key": "alpha", "label": "Alpha Testing", "tasks": [] },
    { "key": "beta", "label": "Beta Testing", "tasks": [] },
    { "key": "prod", "label": "Prod (Done)", "tasks": [] }
  ],
  "columns": [...]
}
```

---

### 3.2 Create Task ✅
```bash
curl -X POST http://localhost:3000/api/v1/rooms/ROOM_ID_HERE/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Fix login bug",
    "description": "Users cannot login with email"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "task": {
    "_id": "675fd...",
    "roomId": "675fd...",
    "title": "Fix login bug",
    "description": "Users cannot login with email",
    "status": "todo",
    "createdAt": "2024-12-17T02:00:00.000Z",
    "updatedAt": "2024-12-17T02:00:00.000Z"
  }
}
```

**Error - Missing title (400):**
```json
{ "error": "Task title is required" }
```

---

### 3.3 Update Task (Move Columns) ✅
```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/TASK_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "inprogress"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "task": {
    "_id": "675fd...",
    "status": "inprogress",
    ...
  }
}
```

**Valid status values:** `todo`, `inprogress`, `alpha`, `beta`, `prod`

**Error - Invalid status (400):**
```json
{ "error": "Invalid status" }
```

---

### 3.4 Delete Task ✅
```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/TASK_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task deleted",
  "taskId": "675fd..."
}
```

---

## 4. Socket.IO Events Testing

Connect with Socket.IO client:
```javascript
const socket = io('http://localhost:3000');

// Join room with token
socket.emit('join-room', { token: 'YOUR_TOKEN_HERE' });

// Or join with credentials
socket.emit('join-room', { 
  username: 'John', 
  avatar: 'hero-1', 
  roomCode: 'ABC123' 
});

// Listen for events
socket.on('current-users', (users) => console.log('Users:', users));
socket.on('new-user-joined', (data) => console.log('Joined:', data));
socket.on('user-left', (data) => console.log('Left:', data));
socket.on('task-created', (data) => console.log('Task:', data));
socket.on('room-abolished', () => console.log('Room deleted!'));

// Create task
socket.emit('task-create', {
  roomCode: 'ABC123',
  title: 'New Task',
  description: 'Description here'
});

// Quit room
socket.emit('quit-room');
```

---

## 5. Quick Test Flow

1. **Create Room** → Save token and roomCode
2. **Join Room** (other user) → Save token
3. **Create Task** → Save taskId
4. **Update Task** → Move to "inprogress"
5. **Get Tasks** → Verify task moved
6. **Delete Task** → Verify deleted
7. **Abolish Room** → Test kicked notification
