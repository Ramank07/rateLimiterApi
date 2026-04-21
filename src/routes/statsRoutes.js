import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  return res.status(200).json({
    stats: req.requestStore.getAll(),
    rate_limit: req.limiter.getStats(),
  });
});

export default router;
