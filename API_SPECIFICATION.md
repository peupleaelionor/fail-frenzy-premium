# Fail Frenzy: The Loop - REST API Specification

## Base URL
```
https://api.failfrenzy.com/v1
```

## Authentication
All endpoints require Bearer token authentication in the Authorization header:
```
Authorization: Bearer {jwt_token}
```

---

## 1. AUTHENTICATION ENDPOINTS

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "username": "player123",
  "email": "player@example.com",
  "password": "securePassword123",
  "deviceId": "device-uuid-123",
  "platform": "iOS",
  "osVersion": "15.0"
}
```

**Response (201):**
```json
{
  "userId": 12345,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "refreshToken": "refresh-token-xyz"
}
```

---

### POST /auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "player@example.com",
  "password": "securePassword123",
  "deviceId": "device-uuid-123"
}
```

**Response (200):**
```json
{
  "userId": 12345,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "profile": {
    "displayName": "Player123",
    "maxFailStreak": 50,
    "totalScore": 5000,
    "level": 5
  }
}
```

---

### POST /auth/refresh
Refresh JWT token using refresh token.

**Request:**
```json
{
  "refreshToken": "refresh-token-xyz"
}
```

**Response (200):**
```json
{
  "token": "new-jwt-token",
  "expiresIn": 86400
}
```

---

## 2. PLAYER PROFILE ENDPOINTS

### GET /profile
Get current player profile.

**Response (200):**
```json
{
  "userId": 12345,
  "username": "player123",
  "displayName": "Player123",
  "avatarUrl": "https://...",
  "bio": "Casual gamer",
  "currentFailStreak": 25,
  "maxFailStreak": 50,
  "totalLoops": 1000,
  "totalScore": 50000,
  "totalPlaytimeHours": 100,
  "level": 5,
  "experiencePoints": 5000,
  "country": "US",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

### PUT /profile
Update player profile.

**Request:**
```json
{
  "displayName": "NewName",
  "bio": "Updated bio",
  "avatarUrl": "https://..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

### GET /profile/statistics
Get detailed player statistics.

**Response (200):**
```json
{
  "totalSessions": 500,
  "totalPlaytimeHours": 100,
  "averageSessionLength": 12,
  "averageScore": 100,
  "maxStreak": 50,
  "averageDifficulty": 0.65,
  "winRate": 0.45,
  "lastPlayedAt": "2025-01-12T10:00:00Z"
}
```

---

## 3. GAME SESSION ENDPOINTS

### POST /sessions/start
Start a new game session.

**Request:**
```json
{
  "deviceMemoryMb": 2048,
  "deviceBatteryPercent": 85,
  "networkType": "wifi"
}
```

**Response (201):**
```json
{
  "sessionId": "session-uuid-123",
  "startTime": "2025-01-12T10:00:00Z",
  "initialDifficulty": 0.5
}
```

---

### POST /sessions/{sessionId}/end
End current game session.

**Request:**
```json
{
  "endTime": "2025-01-12T10:15:00Z",
  "finalFailStreak": 25,
  "finalScore": 2500,
  "loopsPlayed": 100,
  "averageDifficulty": 0.65,
  "crashOccurred": false
}
```

**Response (200):**
```json
{
  "success": true,
  "sessionSummary": {
    "durationSeconds": 900,
    "experienceGained": 250,
    "coinsEarned": 500,
    "achievementsUnlocked": ["streak_25"]
  }
}
```

---

### POST /sessions/{sessionId}/event
Log game event during session.

**Request:**
```json
{
  "eventName": "obstacle_avoided",
  "eventValue": 10,
  "timestamp": "2025-01-12T10:05:00Z",
  "customParams": {
    "obstacleType": "tap",
    "difficulty": 0.65
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "eventId": "event-uuid-123"
}
```

---

## 4. COSMETICS ENDPOINTS

### GET /cosmetics
Get all available cosmetics.

**Query Parameters:**
- `type` (optional): Filter by type (effect, character_skin, badge, ui_theme, bundle)
- `rarity` (optional): Filter by rarity (common, uncommon, rare, epic, legendary)
- `sort` (optional): Sort by (name, price, rarity, release_date)

**Response (200):**
```json
{
  "cosmetics": [
    {
      "id": 1,
      "cosmeticKey": "golden_aura",
      "name": "Golden Aura",
      "type": "effect",
      "rarity": "common",
      "description": "Unlock at 5 fail streak",
      "unlockThreshold": 5,
      "basePrice": 0,
      "premiumPrice": 2.99,
      "iconUrl": "https://...",
      "previewUrl": "https://...",
      "isUnlocked": true,
      "isEquipped": false
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 10
}
```

---

### GET /cosmetics/{cosmeticId}
Get specific cosmetic details.

**Response (200):**
```json
{
  "id": 1,
  "cosmeticKey": "golden_aura",
  "name": "Golden Aura",
  "type": "effect",
  "rarity": "common",
  "description": "Unlock at 5 fail streak",
  "unlockThreshold": 5,
  "basePrice": 0,
  "premiumPrice": 2.99,
  "iconUrl": "https://...",
  "previewUrl": "https://...",
  "colorHex": "#FFD700",
  "animationSpeed": 1.2,
  "isUnlocked": true,
  "isEquipped": false,
  "unlockedAt": "2025-01-10T15:30:00Z"
}
```

---

### POST /cosmetics/{cosmeticId}/equip
Equip a cosmetic.

**Response (200):**
```json
{
  "success": true,
  "message": "Cosmetic equipped successfully"
}
```

---

### POST /cosmetics/{cosmeticId}/purchase
Purchase a cosmetic.

**Request:**
```json
{
  "paymentMethod": "apple_pay",
  "currency": "USD"
}
```

**Response (201):**
```json
{
  "success": true,
  "transactionId": "txn-uuid-123",
  "cosmeticUnlocked": true,
  "newBalance": 50.00
}
```

---

## 5. LEADERBOARD ENDPOINTS

### GET /leaderboard
Get global leaderboard.

**Query Parameters:**
- `limit` (optional, default: 100): Number of entries to return
- `offset` (optional, default: 0): Pagination offset
- `region` (optional): Filter by region
- `timeframe` (optional): all_time, monthly, weekly, daily

**Response (200):**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": 999,
      "username": "TopPlayer",
      "displayName": "Top Player",
      "failStreak": 500,
      "totalScore": 500000,
      "totalLoops": 10000,
      "playtimeHours": 1000,
      "avatarUrl": "https://...",
      "isVerified": true
    }
  ],
  "total": 1000000,
  "yourRank": 5000,
  "yourEntry": {
    "rank": 5000,
    "failStreak": 50,
    "totalScore": 5000
  }
}
```

---

### GET /leaderboard/friends
Get leaderboard for friends only.

**Response (200):**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": 123,
      "username": "Friend1",
      "failStreak": 100,
      "totalScore": 10000,
      "isFriend": true,
      "friendStatus": "accepted"
    }
  ]
}
```

---

## 6. ACHIEVEMENTS ENDPOINTS

### GET /achievements
Get all achievements.

**Response (200):**
```json
{
  "achievements": [
    {
      "id": 1,
      "achievementKey": "first_fail",
      "name": "First Fail",
      "description": "Experience your first failure",
      "iconUrl": "https://...",
      "points": 10,
      "rarity": "common",
      "isUnlocked": true,
      "unlockedAt": "2025-01-01T00:00:00Z",
      "progress": 100
    }
  ],
  "totalPoints": 500,
  "unlockedCount": 15,
  "totalCount": 50
}
```

---

## 7. FRIENDS ENDPOINTS

### GET /friends
Get friend list.

**Query Parameters:**
- `status` (optional): accepted, pending, blocked

**Response (200):**
```json
{
  "friends": [
    {
      "userId": 123,
      "username": "Friend1",
      "displayName": "Friend One",
      "avatarUrl": "https://...",
      "status": "accepted",
      "addedAt": "2024-12-01T00:00:00Z",
      "lastPlayedAt": "2025-01-12T10:00:00Z"
    }
  ],
  "total": 50
}
```

---

### POST /friends/{userId}/add
Send friend request.

**Response (201):**
```json
{
  "success": true,
  "message": "Friend request sent"
}
```

---

### POST /friends/{userId}/accept
Accept friend request.

**Response (200):**
```json
{
  "success": true,
  "message": "Friend request accepted"
}
```

---

### DELETE /friends/{userId}
Remove friend or cancel friend request.

**Response (200):**
```json
{
  "success": true,
  "message": "Friend removed"
}
```

---

## 8. CHALLENGES ENDPOINTS

### POST /challenges/create
Create a new challenge.

**Request:**
```json
{
  "challengedUserId": 123,
  "challengeType": "fail_streak",
  "targetFailStreak": 50,
  "durationHours": 24
}
```

**Response (201):**
```json
{
  "challengeId": "challenge-uuid-123",
  "status": "pending",
  "createdAt": "2025-01-12T10:00:00Z",
  "expiresAt": "2025-01-13T10:00:00Z"
}
```

---

### GET /challenges/{challengeId}
Get challenge details.

**Response (200):**
```json
{
  "challengeId": "challenge-uuid-123",
  "challengerId": 456,
  "challengedId": 123,
  "challengeType": "fail_streak",
  "targetFailStreak": 50,
  "status": "active",
  "createdAt": "2025-01-12T10:00:00Z",
  "expiresAt": "2025-01-13T10:00:00Z",
  "participants": [
    {
      "userId": 456,
      "currentFailStreak": 25,
      "isLeading": true
    },
    {
      "userId": 123,
      "currentFailStreak": 20,
      "isLeading": false
    }
  ]
}
```

---

## 9. NOTIFICATIONS ENDPOINTS

### GET /notifications
Get user notifications.

**Query Parameters:**
- `unreadOnly` (optional): true/false
- `limit` (optional, default: 50)

**Response (200):**
```json
{
  "notifications": [
    {
      "id": 1,
      "type": "achievement_unlocked",
      "title": "Achievement Unlocked",
      "message": "You unlocked the 'First Fail' achievement",
      "data": {
        "achievementId": 1
      },
      "isRead": false,
      "createdAt": "2025-01-12T10:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

---

### PUT /notifications/{notificationId}/read
Mark notification as read.

**Response (200):**
```json
{
  "success": true
}
```

---

## 10. CLOUD SAVE ENDPOINTS

### GET /cloud-save
Get cloud save data.

**Response (200):**
```json
{
  "userId": 12345,
  "saveData": {
    "currentFailStreak": 25,
    "maxFailStreak": 50,
    "totalScore": 5000,
    "unlockedCosmetics": ["golden_aura", "neon_trail"]
  },
  "version": 1,
  "lastModified": "2025-01-12T10:00:00Z"
}
```

---

### POST /cloud-save
Upload/update cloud save data.

**Request:**
```json
{
  "saveData": {
    "currentFailStreak": 30,
    "maxFailStreak": 50,
    "totalScore": 6000,
    "unlockedCosmetics": ["golden_aura", "neon_trail", "glitch_effect"]
  },
  "version": 1,
  "deviceId": "device-uuid-123"
}
```

**Response (200):**
```json
{
  "success": true,
  "version": 2,
  "lastModified": "2025-01-12T10:05:00Z"
}
```

---

## ERROR RESPONSES

### 400 Bad Request
```json
{
  "error": "invalid_request",
  "message": "Missing required field: email",
  "code": 400
}
```

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Invalid or expired token",
  "code": 401
}
```

### 403 Forbidden
```json
{
  "error": "forbidden",
  "message": "You don't have permission to access this resource",
  "code": 403
}
```

### 404 Not Found
```json
{
  "error": "not_found",
  "message": "Resource not found",
  "code": 404
}
```

### 429 Too Many Requests
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60,
  "code": 429
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_server_error",
  "message": "An unexpected error occurred",
  "code": 500
}
```

---

## RATE LIMITING

- **Default**: 100 requests per minute per user
- **Authentication**: 10 requests per minute per IP
- **Leaderboard**: 5 requests per minute per user
- **Cloud Save**: 10 requests per minute per user

Rate limit info is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1673520000
```

---

## PAGINATION

All list endpoints support pagination:
- `page` (optional, default: 1): Page number
- `pageSize` (optional, default: 10, max: 100): Items per page

Response includes:
```json
{
  "items": [...],
  "total": 1000,
  "page": 1,
  "pageSize": 10,
  "totalPages": 100
}
```

---

## VERSIONING

API version is specified in the URL path: `/v1/`

Current version: **v1**

---

## WEBHOOKS

The API supports webhooks for real-time events:

### Webhook Events
- `session.completed`
- `achievement.unlocked`
- `cosmetic.unlocked`
- `leaderboard.updated`
- `friend.request`
- `challenge.completed`

### Webhook Configuration
POST `/webhooks/register`
```json
{
  "url": "https://yourdomain.com/webhook",
  "events": ["session.completed", "achievement.unlocked"],
  "secret": "webhook-secret-key"
}
```

---

## DOCUMENTATION

Full API documentation available at: https://docs.failfrenzy.com/api

SDKs available for:
- Unity (C#)
- Unreal Engine (C++)
- JavaScript/TypeScript
- Python
- Swift (iOS)
- Kotlin (Android)
