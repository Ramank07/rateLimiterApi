import express from 'express';
import { createInMemoryRateLimiter } from './rateLimiter.js';
import { createInMemoryRequestStore } from './requestStore.js';
import requestRoutes from './routes/requestRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/handlers.js';

const app = express();
const limiter = createInMemoryRateLimiter();
const requestStore = createInMemoryRequestStore();


app.use(express.json({ limit: '1mb' }));


app.use((req, res, next) => {
  req.limiter = limiter;
  req.requestStore = requestStore;
  next();
});


app.use('/api/request', requestRoutes);
app.use('/api/stats', statsRoutes);


app.use(notFoundHandler);
app.use(errorHandler);

export default app;
