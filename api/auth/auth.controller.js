import User from '../users/user.model.js';
import Challenge from './challenge.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import CodeforcesService from '../services/codeforces.service.js';

const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

const createChallenge = async (req, res) => {
    const { handle } = req.body;
    if (!handle) {
        return res.status(400).json({ error: 'Codeforces handle is required' });
    }

    try {
        await CodeforcesService.getUserSubmissions(handle, 1, 1);

        const problems = await CodeforcesService.getProblemSet();
        const randomProblem = problems[Math.floor(Math.random() * problems.length)];

        const uniqueString = crypto.randomBytes(16).toString('hex');

        await Challenge.deleteOne({ handle });

        const challenge = await Challenge.create({
            handle,
            problemName: randomProblem.name,
            problemUrl: `https://codeforces.com/problemset/problem/${randomProblem.contestId}/${randomProblem.index}`,
            contestId: randomProblem.contestId,
            problemIndex: randomProblem.index,
            uniqueString,
        });

        res.status(200).json({
            problemName: challenge.problemName,
            problemUrl: challenge.problemUrl,
            uniqueString: challenge.uniqueString,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create challenge. User might not exist.' });
    }
};

const verifyChallenge = async (req, res) => {
    const { handle } = req.body;
    if (!handle) {
        return res.status(400).json({ error: 'Codeforces handle is required' });
    }

    try {
        const challenge = await Challenge.findOne({ handle });
        if (!challenge) {
            return res.status(404).json({ error: 'No active challenge found' });
        }

        const submissions = await CodeforcesService.getUserSubmissions(handle, 1, 1);

        if (!submissions || submissions.length === 0) {
            return res.status(400).json({ error: 'No recent submissions found' });
        }

        const latestSubmission = submissions[0];

        if (latestSubmission.problem.contestId.toString() !== challenge.contestId.toString() ||
            latestSubmission.problem.index !== challenge.problemIndex) {
            return res.status(400).json({ error: 'Verification failed: incorrect problem' });
        }

        let user = await User.findOne({ handle });
        const cfUser = await CodeforcesService.getUserInfo(handle);

        if (!user) {
            user = await User.create({
                handle: cfUser.handle,
                email: cfUser.email || `${cfUser.handle}@codedojo.io`,
                rating: cfUser.rating,
                rank: cfUser.rank,
                maxRating: cfUser.maxRating,
                maxRank: cfUser.maxRank,
            });
        } else {
            user.rating = cfUser.rating;
            user.rank = cfUser.rank;
            user.maxRating = cfUser.maxRating;
            user.maxRank = cfUser.maxRank;
            await user.save();
        }

        const token = createToken(user._id);

        await Challenge.deleteOne({ handle });

        res.status(200).json({
            _id: user._id,
            handle: user.handle,
            email: user.email,
            rating: user.rating,
            token,
        });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ error: 'Verification failed' });
    }
};

export { createChallenge, verifyChallenge };