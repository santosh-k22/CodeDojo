import express from 'express';
import {
    searchUsers,
    findUserByHandle
} from './user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes below require authentication
router.use(protect);

router.get('/search', searchUsers);
router.get('/find/:handle', findUserByHandle);

export default router;