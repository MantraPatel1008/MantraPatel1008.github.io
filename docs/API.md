# JARVIS OS API Reference

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API requests require an API key in the header:

```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Orchestrator

#### Execute Command

```
POST /execute
```

**Request:**
```json
{
  "command": "Find clients for Slay Ads and close 3 meetings this week",
  "context": {
    "company": "Slay Ads",
    "goal": "3 meetings",
    "timeframe": "this week"
  }
}
```

**Response:**
```json
{
  "id": "task-123",
  "status": "processing",
  "tasks": [
    {
      "id": "task-1",
      "agentType": "LeadFinder",
      "status": "queued"
    }
  ]
}
```

#### Get System Status

```
GET /status
```

**Response:**
```json
{
  "isRunning": true,
  "agentCount": 3,
  "queuedTasks": 5,
  "registeredAgents": ["LeadFinder", "Outreach", "ContentCreator"]
}
```

### Leads

#### Get Leads

```
GET /leads?industry=gym&limit=10
```

**Response:**
```json
{
  "leads": [
    {
      "id": "lead-1",
      "name": "Best Fitness Gym",
      "email": "owner@bestfitness.com",
      "industry": "gym",
      "confidence": 0.85,
      "source": "instagram"
    }
  ],
  "total": 150
}
```

#### Create Lead

```
POST /leads
```

**Request:**
```json
{
  "name": "New Business",
  "email": "contact@business.com",
  "industry": "restaurant",
  "confidence": 0.9
}
```

### Tasks

#### Get Task Status

```
GET /tasks/:taskId
```

**Response:**
```json
{
  "id": "task-123",
  "status": "completed",
  "result": {
    "leadsFound": 50,
    "qualifiedLeads": 35
  }
}
```

#### Queue Task

```
POST /tasks
```

**Request:**
```json
{
  "agentType": "LeadFinder",
  "input": {
    "industry": "gym",
    "region": "New York"
  }
}
```

### Memory

#### Store Data

```
POST /memory
```

**Request:**
```json
{
  "key": "client_preferences_123",
  "data": {
    "industry": "gym",
    "budget": 5000
  }
}
```

#### Retrieve Data

```
GET /memory/:key
```

#### Search Memory

```
GET /memory/search?query=gym
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid input",
  "details": "Missing required field: email"
}
```

### 401 Unauthorized

```json
{
  "error": "Invalid API key"
}
```

### 500 Server Error

```json
{
  "error": "Internal server error",
  "id": "error-123"
}
```

## Rate Limiting

- 1000 requests per hour per API key
- Burst limit: 100 requests per minute

## Webhooks

Subscribe to events:

```
POST /webhooks/subscribe
```

**Request:**
```json
{
  "event": "task.completed",
  "url": "https://yoursite.com/webhook"
}
```

**Webhook Payload:**
```json
{
  "event": "task.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "taskId": "task-123",
    "result": { ... }
  }
}
```
