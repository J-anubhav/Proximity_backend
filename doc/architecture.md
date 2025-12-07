# Pixel Server Setup & Documentation

## Architecture Overview
This project follows the "Pixel Office" architecture, separating the backend into a robust Node.js/TypeScript server (`pixel-server`) and a frontend (`pixel-client`).

### Directory Structure
```
/pixel-server (Current Directory)
├── src
│   ├── config          # Redis & Env Config
│   ├── controllers     # HTTP Logic (Auth, Map)
│   ├── routes          # API Route Definitions
│   ├── services        # Core Business Logic (Map Parsing)
│   ├── app.ts          # Express App Setup
│   └── server.ts       # Entry Point
├── public
│   └── map.json        # Tiled Export with "Zones" layer
└── package.json
```

## Setup Instructions

### 1. Environment
Ensure you have **Redis** running locally or via Docker:
```bash
docker run --name pixel-redis -d -p 6379:6379 redis
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Server
```bash
npm run dev
```

## API Endpoints
- `GET /api/v1/health`: Health check.
- `GET /api/v1/map`: Fetch the map JSON.
- `POST /api/v1/login`: Login to get User ID and Spawn point.
    - Body: `{ "username": "Name", "avatar": "avatar-id" }`

## Next Steps
Follow the implementation plan to build out the Socket.io handlers in the next phase.
