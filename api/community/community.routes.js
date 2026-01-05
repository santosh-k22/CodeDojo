import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
    createPost,
    getPosts,
    votePost,
    getPostById,
    deletePost
} from './community.controller.js';

const router = express.Router();

// --- PUBLIC ROUTES ---
router.get('/', getPosts);
router.get('/:postId', getPostById);

// --- PROTECTED ROUTES ---
router.post('/', protect, createPost);
router.post('/:postId/vote', protect, votePost);
router.delete('/:postId', protect, deletePost);

export default router;