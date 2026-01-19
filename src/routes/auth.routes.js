import express from 'express';
import { loginUser, registerUser, logoutUser,refreshToken,resendVerificationEmail } from '../controllers/auth.controller.js';
import { VerifyJwt } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route for user registration
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

// Route for user logout
router.post('/logout', VerifyJwt, logoutUser);

// Route for refreshing tokens
router.post('/refresh-token',VerifyJwt, refreshToken);

// Route for resending verification email
router.post('/resend-verification-email', VerifyJwt, resendVerificationEmail);
export default router;