import express from 'express';
import { changePassword } from '../../controllers/AuthControllerchangepassword.js'; // Adjust the path as needed

const router = express.Router();

// Change password route
router.post('/change-password', changePassword); 

export default router;
