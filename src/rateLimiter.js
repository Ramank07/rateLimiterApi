class RateLimiter {
  constructor(options = {}) {
    this.limit = options.limit || 5;
    this.windowMs = options.windowMs || 60000;
    this.userWindows = new Map();
  }

  consume(userId) {
    const currentTime = Date.now();
    const windowStart = currentTime - this.windowMs;
    const timestamps = this.userWindows.get(userId) || [];
    const activeTimestamps = timestamps.filter((ts) => ts > windowStart);

    if (activeTimestamps.length >= this.limit) {
      this.userWindows.set(userId, activeTimestamps);
      return {
        allowed: false,
        limit: this.limit,
        remaining: 0,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((activeTimestamps[0] + this.windowMs - currentTime) / 1000)
        ),
        windowMs: this.windowMs,
      };
    }

    activeTimestamps.push(currentTime);
    this.userWindows.set(userId, activeTimestamps);

    return {
      allowed: true,
      limit: this.limit,
      remaining: this.limit - activeTimestamps.length,
      retryAfterSeconds: 0,
      windowMs: this.windowMs,
    };
  }

  getStats() {
    const currentTime = Date.now();
    const windowStart = currentTime - this.windowMs;
    const users = {};

    for (const [userId, timestamps] of this.userWindows.entries()) {
      const activeTimestamps = timestamps.filter((ts) => ts > windowStart);
      this.userWindows.set(userId, activeTimestamps);

      users[userId] = {
        requestsInCurrentWindow: activeTimestamps.length,
        limit: this.limit,
        remaining: Math.max(0, this.limit - activeTimestamps.length),
        windowMs: this.windowMs,
        isRateLimited: activeTimestamps.length >= this.limit,
      };
    }

    return {
      windowMs: this.windowMs,
      generatedAt: new Date(currentTime).toISOString(),
      users,
    };
  }
}

function createInMemoryRateLimiter(options = {}) {
  return new RateLimiter(options);
}

export { createInMemoryRateLimiter };
