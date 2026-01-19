import express from 'express';
import { loginUser, 
    registerUser, 
    logoutUser,
    refreshToken,
    resendVerificationEmail,
    verifyEmail
 } from '../controllers/auth.controller.js';
import { VerifyJwt } from '../middlewares/auth.middleware.js';

const authRouter = express.Router();

// Route for user registration
authRouter.post('/register', registerUser);

// Route for user login
authRouter.post('/login', loginUser);

// Route for user logout
authRouter.post('/logout', VerifyJwt, logoutUser);

// Route for refreshing tokens
authRouter.post('/refresh-token',VerifyJwt, refreshToken);

// Route for resending verification email
authRouter.post('/resend-verification-email', VerifyJwt, resendVerificationEmail);

// Route for verifying email
authRouter.get('/verify-email', verifyEmail);
export default authRouter;