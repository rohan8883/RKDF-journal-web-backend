import useRouter from 'express';
import { sendOtp, verifyOtp } from '../../../controllers/otp.controller.js';
const router = useRouter.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router;
