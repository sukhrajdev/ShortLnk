import express from 'express';
import { createLink,getLink,getAllLinks,deleteLink,updateLink } from '../controllers/link.controller.js';
import { VerifyJwt } from '../middlewares/auth.middleware.js';

const linkRouter = express.Router();

// Route for creating a new link
linkRouter.post('/', VerifyJwt, createLink);

// Route for retrieving all links for a user
linkRouter.get('/', VerifyJwt, getAllLinks);

// Route for deleting a link by its code
linkRouter.delete('/:LinkCode', VerifyJwt, deleteLink);

// Route for updating a link by its code
linkRouter.put('/:LinkCode', VerifyJwt, updateLink);

export default linkRouter;