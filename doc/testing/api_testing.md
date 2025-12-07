# Pixel Server API Testing Guide

This document provides `curl` commands and expected responses for testing the Pixel Server HTTP API.

Base URL: `http://localhost:3000/api/v1`

## 1. Health Check
**Endpoint:** `GET /health`

### Request
```bash
curl http://localhost:3000/api/v1/health
```

### Response (Success)
- **Status:** `200 OK`
- **Body:**
  ```text
  Pixel Server OK
  ```

---

## 2. Login
**Endpoint:** `POST /login`
**Description:** Generates a session, User ID, and spawn point.

### Scenario A: Successful Login
**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/login \
     -H "Content-Type: application/json" \
     -d '{"username": "Neo", "avatar": "hero-1"}'
```

**Response:**
- **Status:** `200 OK`
- **Body:**
  ```json
  {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "username": "Neo",
      "avatar": "hero-1",
      "spawn": {
          "x": 432,
          "y": 315
      }
  }
  ```

### Scenario B: Missing/Invalid Username
**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/login \
     -H "Content-Type: application/json" \
     -d '{"username": ""}'
```

**Response:**
- **Status:** `400 Bad Request`
- **Body:**
  ```json
  {
      "error": "Username too short"
  }
  ```

---

## 3. Get Map
**Endpoint:** `GET /map`
**Description:** Returns the Tiled JSON map data.

### Scenario A: Map Found
**Request:**
```bash
curl http://localhost:3000/api/v1/map
```

**Response:**
- **Status:** `200 OK`
- **Headers:** `Content-Type: application/json`
- **Body:** (Truncated for brevity)
  ```json
  {
      "width": 32,
      "height": 32,
      "layers": [
          {
              "name": "Zones",
              "objects": [...]
          }
      ],
      ...
  }
  ```

### Scenario B: Map File Missing (Server Config Error)
**Request:** Same as above.
**Response:**
- **Status:** `500 Internal Server Error`
- **Body:**
  ```json
  {
      "error": "Internal Server Error"
  }
  ```
