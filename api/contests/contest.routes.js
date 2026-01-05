import express from 'express';
import { protect } from '../middleware/auth.middleware.js';

import {
    createContest,
    getContests,
    getContestBySlug,
    addRandomProblems,
    getLeaderboard,
    joinContest,
    addManualProblem,
} from './contest.controller.js';

const router = express.Router();

// --- PUBLIC ROUTES ---
router.get('/', getContests);
router.get('/slug/:slug', getContestBySlug);
router.get('/slug/:slug/leaderboard', getLeaderboard);

// --- PROTECTED ROUTES ---
router.post('/create', protect, createContest);
router.post('/slug/:slug/join', protect, joinContest);
router.post('/:contestId/add-random', protect, addRandomProblems);
router.post('/:contestId/add-manual', protect, addManualProblem);

export default router;