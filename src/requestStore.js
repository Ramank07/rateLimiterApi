class RequestStore {
  constructor() {
    this.userStats = new Map();
  }

  recordAcceptedRequest(userId) {
    const existing = this.userStats.get(userId) || {
      acceptedRequests: 0,
      lastAcceptedAt: null,
    };

    existing.acceptedRequests += 1;
    existing.lastAcceptedAt = new Date().toISOString();
    this.userStats.set(userId, existing);
  }

  getAll() {
    const stats = {};

    for (const [userId, value] of this.userStats.entries()) {
      stats[userId] = {
        acceptedRequests: value.acceptedRequests,
        lastAcceptedAt: value.lastAcceptedAt,
      };
    }

    return stats;
  }
}

function createInMemoryRequestStore() {
  return new RequestStore();
}

export { createInMemoryRequestStore };
