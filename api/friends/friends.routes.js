import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
    getFriendsData,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest
} from './friends.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', getFriendsData);
router.post('/send/:recipientId', sendFriendRequest);
router.post('/accept/:senderId', acceptFriendRequest);
router.post('/reject/:senderId', rejectFriendRequest);

export default router;