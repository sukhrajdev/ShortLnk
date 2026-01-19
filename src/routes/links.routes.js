import express from 'express';
import { createLink } from '../controllers/link.controller.js';
import { VerifyJwt } from '../middlewares/auth.middleware.js';

const linkRouter = express.Router();

// Route for creating a new link
linkRouter.post('/', VerifyJwt, createLink);

export default linkRouter;