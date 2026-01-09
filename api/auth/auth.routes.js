import express from 'express';
import { createChallenge, verifyChallenge } from './auth.controller.js';

const router = express.Router();

router.post('/challenge', createChallenge);
router.post('/verify', verifyChallenge);

export default router;