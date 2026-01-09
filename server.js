import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // limit each IP to 300 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

const db = process.env.MONGO_URI;

mongoose
  .connect(db)
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.error('MongoDB connection error:', err));

import authRoutes from './api/auth/auth.routes.js';
import userRoutes from './api/users/user.routes.js';
import contestRoutes from './api/contests/contest.routes.js';
import profileRoutes from './api/profile/profile.routes.js';
import communityRoutes from './api/community/community.routes.js';
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/contests', contestRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/community', communityRoutes);

const port = process.env.PORT || 5001;

app.listen(port, () => console.log(`Server started on port ${port}`));
