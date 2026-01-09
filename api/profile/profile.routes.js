import express from 'express';
import { protect } from '../middleware/auth.middleware.js';

import {
    getUserProfileData,
    getProfileStats,
    getProblemRecommendations,
    getProfileInfo,
    getSubmissionStats
} from './profile.controller.js';

const router = express.Router();

router.get('/data', protect, getUserProfileData);
router.get('/recommendations', protect, getProblemRecommendations);

router.get('/info/:handle', getProfileInfo);
router.get('/stats/:handle', getProfileStats);
router.get('/submissions/:handle', getSubmissionStats);

export default router;