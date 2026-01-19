import express from 'express';
import {
    updateUser,
    deleteUser,
    forgetPassword,
    getUser
} from '../controllers/user.controller.js';
import { VerifyJwt } from '../middlewares/auth.middleware.js';

const userRouter = express.Router();

// Route for updating user details
userRouter.put('/:id', VerifyJwt, updateUser);

// Route for deleting a user
userRouter.delete('/:id', VerifyJwt, deleteUser);

// Route for forgetting password
userRouter.post('/forget-password', VerifyJwt, forgetPassword);

// Route for getting user details
userRouter.get('/:id', VerifyJwt, getUser);

export default userRouter;
