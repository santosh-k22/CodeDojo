import User from '../users/user.model.js';
import Post from '../community/post.model.js';
import CodeforcesService from '../services/codeforces.service.js';
import cache from '../utils/cache.js';

export const getUserProfileData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.handle) {
            return res.status(404).json({ msg: 'User or Codeforces handle not found' });
        }

        const cacheKey = `profile_data_${user.handle}`;
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            return res.json(cachedData);
        }

        const [userInfo, userSubmissions, communityPosts] = await Promise.all([
            CodeforcesService.getUserInfo(user.handle),
            CodeforcesService.getUserSubmissions(user.handle),
            Post.find().sort({ createdAt: -1 }).limit(3).populate('author', 'handle')
        ]);

        const profileData = {
            info: userInfo,
            submissions: userSubmissions.slice(0, 10),
            communityPosts: communityPosts,
        };

        cache.set(cacheKey, profileData, 300);
        res.json(profileData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const getProfileStats = async (req, res) => {
    const { handle } = req.params;
    try {
        const cacheKey = `profile_stats_${handle}`;
        const cachedStats = cache.get(cacheKey);

        if (cachedStats) {
            return res.status(200).json(cachedStats);
        }

        const submissions = await CodeforcesService.getUserSubmissions(handle);

        const verdicts = {};
        const tags = {};
        const difficulty = {};
        const solvedProblems = new Set();

        submissions.forEach(sub => {
            const verdict = sub.verdict || 'UNKNOWN';
            verdicts[verdict] = (verdicts[verdict] || 0) + 1;

            if (sub.verdict === 'OK') {
                const problemId = `${sub.problem.contestId}-${sub.problem.index}`;

                // Only count stats for unique solved problems
                if (!solvedProblems.has(problemId)) {
                    solvedProblems.add(problemId);

                    sub.problem.tags.forEach(tag => {
                        tags[tag] = (tags[tag] || 0) + 1;
                    });

                    if (sub.problem.rating) {
                        const rating = sub.problem.rating;
                        difficulty[rating] = (difficulty[rating] || 0) + 1;
                    }
                }
            }
        });

        const statsData = { verdicts, tags, difficulty };
        cache.set(cacheKey, statsData, 600);

        res.status(200).json(statsData);
    } catch (error) {
        res.status(404).json({ error: `Could not fetch stats for handle: ${handle}` });
    }
};

export const getProblemRecommendations = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.handle) {
            return res.status(404).json({ msg: 'User or Codeforces handle not found' });
        }

        const handle = user.handle;
        const userRating = user.rating || 1400; // Default to 1400 if no rating

        const submissions = await CodeforcesService.getUserSubmissions(handle);

        const solvedProblems = new Set();
        const tagFrequency = {};

        submissions.forEach(sub => {
            if (sub.verdict === 'OK') {
                const problemId = `${sub.problem.contestId}${sub.problem.index}`;
                solvedProblems.add(problemId);
                sub.problem.tags.forEach(tag => {
                    tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
                });
            }
        });

        const allProblems = await CodeforcesService.getProblemSet();

        const recommendations = allProblems.filter(problem => {
            const problemId = `${problem.contestId}${problem.index}`;
            const rating = problem.rating;

            return !solvedProblems.has(problemId) &&
                rating &&
                rating >= userRating &&
                rating <= userRating + 200;
        });

        recommendations.sort((a, b) => {
            const scoreA = a.tags.reduce((sum, tag) => sum + (tagFrequency[tag] || 0), 0);
            const scoreB = b.tags.reduce((sum, tag) => sum + (tagFrequency[tag] || 0), 0);
            return scoreA - scoreB;
        });

        res.json(recommendations.slice(0, 10));

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const getProfileInfo = async (req, res) => {
    const { handle } = req.params;
    try {
        const cacheKey = `profile_info_full_${handle}`;
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        const [info, submissions] = await Promise.all([
            CodeforcesService.getUserInfo(handle),
            CodeforcesService.getUserSubmissions(handle, 1, 20)
        ]);

        const responseData = { info, submissions };

        cache.set(cacheKey, responseData, 300);

        res.status(200).json(responseData);
    } catch (error) {
        console.error("Profile Info Error:", error.message);
        res.status(404).json({ error: `Could not fetch info for handle: ${handle}` });
    }
};

export const getSubmissionStats = async (req, res) => {
    const { handle } = req.params;
    if (!handle) {
        return res.status(400).json({ message: 'User handle is required' });
    }

    try {
        const cacheKey = `submission_stats_${handle}`;
        const cachedHeatmap = cache.get(cacheKey);

        if (cachedHeatmap) {
            return res.status(200).json(cachedHeatmap);
        }

        const submissions = await CodeforcesService.getUserSubmissions(handle);

        const submissionsByDate = submissions.reduce((acc, submission) => {
            const date = new Date(submission.creationTimeSeconds * 1000).toISOString().split('T')[0];
            if (acc[date]) {
                acc[date]++;
            } else {
                acc[date] = 1;
            }
            return acc;
        }, {});

        const heatmapData = Object.keys(submissionsByDate).map(date => ({
            date: date,
            count: submissionsByDate[date],
        }));

        cache.set(cacheKey, heatmapData, 600);

        res.status(200).json(heatmapData);

    } catch (error) {
        console.error('Error fetching submission stats:', error.message);
        res.status(500).json({ message: 'Server error while fetching submission stats.' });
    }
};