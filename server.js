import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

const db = process.env.MONGO_URI;

mongoose
  .connect(db)
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log(err));

import authRoutes from './api/auth/auth.routes.js';
import userRoutes from './api/users/user.routes.js';
import contestRoutes from './api/contests/contest.routes.js';
import profileRoutes from './api/profile/profile.routes.js';
import communityRoutes from './api/community/community.routes.js';
import friendsRoutes from './api/friends/friends.routes.js';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/contests', contestRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/friends', friendsRoutes);

const port = process.env.PORT || 5001;

app.listen(port, () => console.log(`Server started on port ${port}`));
