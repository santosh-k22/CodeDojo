import express from 'express';
import {
    findUserByHandle,
    getFriendsData,
    toggleFollowUser
} from './user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/find/:handle', findUserByHandle);

// All routes below require authentication
router.use(protect);

router.get('/friends', getFriendsData);
router.post('/follow/:userId', toggleFollowUser);

export default router;