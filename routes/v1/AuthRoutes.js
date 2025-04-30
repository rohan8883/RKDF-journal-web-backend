import useRouter from 'express';
import {
  LoginWithCookie,
  login,
  Register,
  ForgotPassword,
  ResetPassword
} from '../../controller/AuthController.js';

const router = useRouter.Router();
router.post('/login-with-cookie', LoginWithCookie); // endpoint: /auth/login-with-cookie
router.post('/login', login); // endpoint: /auth/login
router.post('/register', Register); // endpoint: /auth/register

router.post('/forgot-password', ForgotPassword); // endpoint: /auth/forgot-password

router.post('/reset-password', ResetPassword); // endpoint: /auth/reset-password

export default router;
