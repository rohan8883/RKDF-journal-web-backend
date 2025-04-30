import rootRouter from 'express';
import {
  authMiddleWare,
} from '../../middleware/_middleware.js';
import authRoutes from './AuthRoutes.js';
import usersRoutes from './UsersRoutes.js';
import roleRoutes from './RoleRoutes.js';
import planRoutes from './PlanRoutes.js';
import otp from './Otp/OtpRoute.js';
import masterRoutes from './mastersRoutes.js';
import changePassword from './ChangepasswordRoute.js'

const router = rootRouter.Router({ mergeParams: true });

router.use('/auth', authRoutes);
router.use('/otp', otp);
// ════════════════════════════║  middleware to protect all routes   ║═════════════════════════════════
router.use(authMiddleWare); // protect all routes
// router.use(authCookieMiddleware); // protect all routes
router.use('/user', usersRoutes);
router.use('/role-d', roleRoutes);
router.use('/role', roleRoutes);
router.use('/plan', planRoutes);
router.use('/masters', masterRoutes);
router.use('/change-pass', changePassword);

export default router;
