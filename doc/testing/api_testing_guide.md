# Proximity Backend API Testing Guide

## Base URL
```
http://localhost:3000/api/v1
```

---

## 1. Health Check

```bash
curl http://localhost:3000/api/v1/health
```
**Response:** `Pixel Server OK`

---

## 2. Room Management

### 2.1 Create Room
**NOTE: One room per user - can't create if you already have an active room!**

```bash
curl -X POST http://localhost:3000/api/v1/rooms/create \
  -H "Content-Type: application/json" \
  -d '{
    "username": "John",
    "avatar": "hero-1",
    "roomName": "My Office"
  }'
```

**Success (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1...",
  "userId": "675fd1234...",
  "username": "John",
  "roomCode": "ABC123",
  "roomName": "My Office",
  "isCreator": true,
  "expiresAt": "2024-12-18T02:00:00.000Z",
  "spawn": { "x": 420, "y": 315 }
}
```

**Error - Already has room (400):**
```json
{
  "error": "You already have an active room. Abolish it first before creating a new one.",
  "existingRoomCode": "XYZ789"
}
```

---

### 2.2 Join Room (by Code)

```bash
curl -X POST http://localhost:3000/api/v1/rooms/join \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Jane",
    "avatar": "hero-2",
    "roomCode": "ABC123"
  }'
```

**Success (200):** Returns token and room details

**Error - Room not found (404):**
```json
{ "error": "Room not found or expired" }
```

---

### 2.3 Get Room Details (by Room Code)

```bash
curl http://localhost:3000/api/v1/rooms/ABC123
```

**Success (200):**
```json
{
  "roomCode": "ABC123",
  "name": "My Office",
  "creator": { "username": "John", "avatar": "hero-1" },
  "users": [...]
}
```

---

### 2.4 Rejoin Room (with Token)

```bash
curl -X POST http://localhost:3000/api/v1/rooms/rejoin \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2.5 Abolish Room (Creator Only)

```bash
curl -X POST http://localhost:3000/api/v1/rooms/abolish \
  -H "Authorization: Bearer CREATOR_TOKEN"
```

**Success (200):**
```json
{ "success": true, "message": "Room abolished successfully" }
```

---

## 3. Logout (with Work Time)

```bash
curl -X POST http://localhost:3000/api/v1/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "username": "John",
  "roomCode": "ABC123",
  "workTime": {
    "totalMinutes": 245,
    "hours": 4,
    "minutes": 5,
    "category": "full",
    "displayText": "4h 5m (Full Day)"
  }
}
```

**Work Time Categories:**
- `< 4 hours` → **half** (Half Day)
- `4-8 hours` → **full** (Full Day)
- `> 8 hours` → **overtime** (8h + Xh OT)

---

## 4. Kanban Tasks (by Room Code)

### 4.1 Get Tasks

```bash
curl http://localhost:3000/api/v1/rooms/ABC123/tasks
```

**Success (200):**
```json
{
  "roomCode": "ABC123",
  "tasks": [...],
  "kanban": [
    { "key": "todo", "label": "To Do", "tasks": [...] },
    { "key": "inprogress", "label": "In Progress", "tasks": [] },
    { "key": "alpha", "label": "Alpha Testing", "tasks": [] },
    { "key": "beta", "label": "Beta Testing", "tasks": [] },
    { "key": "prod", "label": "Prod (Done)", "tasks": [] }
  ]
}
```

---

### 4.2 Create Task

```bash
curl -X POST http://localhost:3000/api/v1/rooms/ABC123/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{ "title": "Fix login bug", "description": "Details here" }'
```

---

### 4.3 Update Task (Move Columns)

```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{ "status": "inprogress" }'
```

**Valid status:** `todo`, `inprogress`, `alpha`, `beta`, `prod`

---

### 4.4 Delete Task

```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 5. Quick Test Flow

1. **Create Room** → Save `token` and `roomCode`
2. **Create Task** using `roomCode`
3. **Update Task** → Move to "inprogress"
4. **Try Create Another Room** → Should fail (one room per user)
5. **Logout** → Check work time response
6. **Abolish Room** → Room deleted

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
