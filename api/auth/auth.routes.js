import express from 'express';
import { createChallenge, verifyChallenge } from './auth.controller.js';

const router = express.Router();

// --- PUBLIC AUTH ROUTES ---
router.post('/challenge', createChallenge);
router.post('/verify', verifyChallenge);

export default router;