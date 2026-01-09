import Contest from './contest.model.js';
import slugify from 'slugify';
import CodeforcesService from '../services/codeforces.service.js';

import cache from '../utils/cache.js';

const LEADERBOARD_CACHE_DURATION = 60 * 1000;

const createContest = async (req, res) => {
    const { name, startTime, endTime } = req.body;
    const slug = slugify(name, { lower: true, strict: true });

    try {
        const contest = await Contest.create({
            name,
            slug,
            slug,
            host: req.user.handle,
            startTime,
            startTime,
            endTime,
        });
        res.status(201).json(contest);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create contest. Name might be taken.' });
    }
};

const getContests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const contests = await Contest.find({})
            .sort({ startTime: -1 })
            .skip(skip)
            .limit(limit);

        const totalContests = await Contest.countDocuments();

        res.status(200).json({
            contests,
            totalPages: Math.ceil(totalContests / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(400).json({ error: 'Failed to fetch contests' });
    }
};

const getContestBySlug = async (req, res) => {
    try {
        const contest = await Contest.findOne({ slug: req.params.slug });
        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }
        res.status(200).json(contest);
    } catch (error) {
        res.status(400).json({ error: 'Failed to fetch contest' });
    }
};

const addRandomProblems = async (req, res) => {
    const { contestId } = req.params;
    const { rating, count } = req.body;

    try {
        const contest = await Contest.findById(contestId);
        if (!contest) return res.status(404).json({ error: 'Contest not found' });

        const allProblems = await CodeforcesService.getProblemSet();

        const filteredProblems = allProblems.filter(p => p.rating === rating && !contest.problems.some(cp => cp.name === p.name));

        const problemsToAdd = [];
        for (let i = 0; i < count && i < filteredProblems.length; i++) {
            const randomIndex = Math.floor(Math.random() * filteredProblems.length);
            const p = filteredProblems.splice(randomIndex, 1)[0];
            problemsToAdd.push({
                problemId: `${p.contestId}${p.index}`,
                contestId: p.contestId,
                index: p.index,
                name: p.name,
                rating: p.rating,
            });
        }

        contest.problems.push(...problemsToAdd);
        await contest.save();
        res.status(200).json(contest);
    } catch (error) {
        res.status(400).json({ error: 'Failed to add random problems' });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const { slug } = req.params;

        const cacheKey = `leaderboard_${slug}`;
        const cachedLeaderboard = cache.get(cacheKey);

        if (cachedLeaderboard) {
            return res.status(200).json(cachedLeaderboard);
        }

        const contest = await Contest.findOne({ slug }).populate('participants.userId', 'rating');
        if (!contest) return res.status(404).json({ error: 'Contest not found' });

        const leaderboard = [];
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const processParticipant = async (participant) => {
            try {
                const allSubmissions = await CodeforcesService.getUserSubmissions(participant.handle, 1, 100);

                const contestSubmissions = allSubmissions.filter(sub => {
                    const subTime = new Date(sub.creationTimeSeconds * 1000);
                    return subTime >= new Date(contest.startTime) && subTime <= new Date(contest.endTime);
                });

                let score = 0;
                let penalty = 0;
                const solvedProblems = new Set();
                const penaltyMap = new Map();

                for (const sub of contestSubmissions.sort((a, b) => a.creationTimeSeconds - b.creationTimeSeconds)) {
                    const problemIdentifier = `${sub.problem.contestId}${sub.problem.index}`;
                    const contestProblem = contest.problems.find(p => p.problemId === problemIdentifier);

                    if (contestProblem && !solvedProblems.has(problemIdentifier)) {
                        const submissionTimeInSeconds = sub.creationTimeSeconds - (new Date(contest.startTime).getTime() / 1000);

                        if (sub.verdict === 'OK') {
                            score++;
                            solvedProblems.add(problemIdentifier);
                            penalty += Math.floor(submissionTimeInSeconds / 60) + (penaltyMap.get(problemIdentifier) || 0);
                        } else {
                            const currentPenalty = penaltyMap.get(problemIdentifier) || 0;
                            penaltyMap.set(problemIdentifier, currentPenalty + 20);
                        }
                    }
                }
                return {
                    handle: participant.handle,
                    rating: participant.userId?.rating,
                    score,
                    penalty
                };

            } catch (err) {
                console.error(`Failed to fetch subs for ${participant.handle}:`, err.message);
                return { handle: participant.handle, rating: participant.userId?.rating, score: 0, penalty: 0, error: true };
            }
        };

        const BATCH_SIZE = 5;
        for (let i = 0; i < contest.participants.length; i += BATCH_SIZE) {
            const batch = contest.participants.slice(i, i + BATCH_SIZE);
            const results = await Promise.all(batch.map(p => processParticipant(p)));
            leaderboard.push(...results);

            // Respect rate limits between batches
            if (i + BATCH_SIZE < contest.participants.length) {
                await delay(500);
            }
        }

        leaderboard.sort((a, b) => b.score - a.score || a.penalty - b.penalty);

        cache.set(cacheKey, leaderboard, 60);

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ error: 'Failed to calculate leaderboard' });
    }
};

const joinContest = async (req, res) => {
    try {
        const contest = await Contest.findOne({ slug: req.params.slug });
        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        const now = new Date();
        if (now > contest.endTime) {
            return res.status(400).json({ error: 'Contest has already ended' });
        }

        const updatedContest = await Contest.findOneAndUpdate(
            {
                slug: req.params.slug,
                'participants.userId': { $ne: req.user._id }
            },
            {
                $addToSet: {
                    participants: {
                        handle: req.user.handle,
                        userId: req.user._id
                    }
                }
            },
            { new: true }
        );

        if (!updatedContest) {
            return res.status(400).json({ error: 'You have already joined this contest' });
        }

        cache.delete(`leaderboard_${req.params.slug}`);

        res.status(200).json({ message: 'Successfully joined the contest' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while joining contest' });
    }
};

const addManualProblem = async (req, res) => {
    const { contestId } = req.params;
    const { problemUrl } = req.body;

    if (!problemUrl) {
        return res.status(400).json({ error: 'Problem URL is required' });
    }

    try {
        let cfContestId, cfProblemIndex;

        const problemSetMatch = problemUrl.match(/problemset\/problem\/(\d+)\/([A-Z0-9]+)/i);
        const contestMatch = problemUrl.match(/contest\/(\d+)\/problem\/([A-Z0-9]+)/i);

        if (problemSetMatch) {
            cfContestId = problemSetMatch[1];
            cfProblemIndex = problemSetMatch[2];
        } else if (contestMatch) {
            cfContestId = contestMatch[1];
            cfProblemIndex = contestMatch[2];
        } else {
            const parts = problemUrl.split('/').filter(p => p);
            if (parts.length >= 2) {
                const last = parts[parts.length - 1];
                const secondLast = parts[parts.length - 2];
                if (!isNaN(secondLast)) {
                    cfContestId = secondLast;
                    cfProblemIndex = last;
                }
            }
        }

        if (!cfContestId || !cfProblemIndex) {
            return res.status(400).json({ error: 'Invalid Codeforces problem URL format' });
        }

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        const allProblems = await CodeforcesService.getProblemSet();

        const problem = allProblems.find(p =>
            p.contestId.toString() === cfContestId.toString() && p.index === cfProblemIndex.toUpperCase()
        );

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found on Codeforces' });
        }

        const problemToAdd = {
            problemId: `${problem.contestId}${problem.index}`,
            contestId: problem.contestId,
            index: problem.index,
            name: problem.name,
            rating: problem.rating,
        };

        contest.problems.push(problemToAdd);
        await contest.save();
        res.status(200).json(contest);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add problem' });
    }
};

const getExternalContests = async (req, res) => {
    try {
        const allContests = await CodeforcesService.getContestsList(false);
        const upcoming = allContests
            .filter(c => c.phase === 'BEFORE')
            .map(c => ({
                id: c.id,
                name: c.name,
                startTime: new Date(c.startTimeSeconds * 1000),
                endTime: new Date((c.startTimeSeconds + c.durationSeconds) * 1000),
                origin: 'Codeforces',
                link: `https://codeforces.com/contest/${c.id}`
            }));
        res.status(200).json(upcoming);
    } catch (error) {
        console.error("External Contests Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch external contests' });
    }
};

export {
    createContest,
    getContests,
    getContestBySlug,
    addRandomProblems,
    getLeaderboard,
    joinContest,
    addManualProblem,
    getExternalContests
};