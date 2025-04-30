import rootRouter from 'express';
import v1Routes from './v1/index.js';
const router = rootRouter.Router({ mergeParams: true });

router.use('/v1', v1Routes);

export default router;
