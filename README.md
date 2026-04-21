# Rate-Limited API Service

Simple Node.js Express API that implements a per-user rate limit of **5 requests per minute** with in-memory storage and concurrency-safe behavior for a **single Node process**.

## Endpoints

### `POST /api/request`

Accepts:

```json
{
  "user_id": "user-123",
  "payload": {
    "message": "hello"
  }
}
```

Success response:

```json
{
  "message": "Request accepted.",
  "user_id": "user-123",
  "payload": {
    "message": "hello"
  },
  "rate_limit": {
    "limit": 5,
    "remaining": 4,
    "window_ms": 60000
  }
}
```

If the limit is exceeded, the API returns `429 Too Many Requests` and includes a `Retry-After` header.

### `GET /api/stats`

Returns per-user accepted request stats plus the current rate-limit window state.

## Steps To Run

### Prerequisites

- Node.js 20+

### Start the server

```bash
npm start
```

The service starts on `http://localhost:3000`.

## Example Requests

### Submit a request

```bash
curl -X POST http://localhost:3000/api/request \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"user-123\",\"payload\":{\"message\":\"hello\"}}"
```

### Read stats

```bash
curl http://localhost:3000/api/stats
```

## Design Decisions

- Built with Express and organized into route modules for a clearer API structure.
- Rate limiting uses a per-user sliding one-minute window stored in memory.
- State mutation is done synchronously inside the request handler, which keeps the limiter accurate under parallel calls in a single Node.js process.
- Accepted request stats are stored separately from rate-limit state so `/stats` can clearly show both total accepted requests and current-window usage.
- The service validates input, returns structured JSON errors, and uses `429` with `Retry-After` for rate-limit responses.

## Concurrency Notes

This implementation handles concurrent requests correctly **within a single Node process** because JavaScript request handling runs on the event loop and the in-memory limiter updates happen without yielding between read/check/write steps.

If the app is scaled to multiple processes or multiple servers, the in-memory rate limiter will no longer be globally accurate. In production, that should be replaced with a shared atomic store such as Redis using a Lua script, sorted sets, or a token-bucket algorithm with centralized coordination.

## Limitations

- Data is lost when the process restarts.
- Rate limiting is only accurate for one application instance.
- No authentication or authorization is included.
- No persistence, queueing, or background retry mechanism is implemented.
- Old in-memory entries are trimmed lazily when a user makes requests or when stats are read.

## What I Would Improve With More Time

- Replace in-memory storage with Redis for distributed, atomic rate limiting.
- Add structured logging, graceful shutdown, and configuration validation.
- Add Docker support and CI checks.
- Add request IDs, metrics, and health-check endpoints.
- Optionally enqueue over-limit work instead of rejecting it immediately.

## Submission Notes

- This workspace did not contain an existing Git repository or remote, so there is no GitHub repository link available yet from the local environment.
- To publish it, initialize git, create a repository on GitHub, and push this folder.
