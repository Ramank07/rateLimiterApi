import { Router } from 'express';

const router = Router();

function validateRequestBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Body must be a JSON object.';
  }

  if (typeof body.user_id !== 'string' || body.user_id.trim() === '') {
    return 'user_id is required and must be a non-empty string.';
  }

  if (!Object.prototype.hasOwnProperty.call(body, 'payload')) {
    return 'payload is required.';
  }

  return null;
}

router.post('/', (req, res) => {
  const validationError = validateRequestBody(req.body);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { user_id: userId, payload } = req.body;
  const rateLimitResult = req.limiter.consume(userId);

  if (!rateLimitResult.allowed) {
    res.set('Retry-After', String(rateLimitResult.retryAfterSeconds));
    return res.status(429).json({
      error: 'Rate limit exceeded. Max 5 requests per user per minute.',
      user_id: userId,
      limit: rateLimitResult.limit,
      retry_after_seconds: rateLimitResult.retryAfterSeconds,
    });
  }

  req.requestStore.recordAcceptedRequest(userId);

  return res.status(200).json({
    message: 'Request accepted.',
    user_id: userId,
    payload,
    rate_limit: {
      limit: rateLimitResult.limit,
      remaining: rateLimitResult.remaining,
      window_ms: rateLimitResult.windowMs,
    },
  });
});

export default router;
