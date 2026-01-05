import User from '../users/user.model.js';
import Post from '../community/post.model.js';
import Contest from '../contests/contest.model.js';
import axios from 'axios';

export const getUserProfileData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.handle) {
            return res.status(404).json({ msg: 'User or Codeforces handle not found' });
        }

        const userInfoPromise = axios.get(`https://codeforces.com/api/user.info?handles=${user.handle}`);
        const userSubmissionsPromise = axios.get(`https://codeforces.com/api/user.status?handle=${user.handle}`);
        const communityPostsPromise = Post.find().sort({ createdAt: -1 }).limit(3).populate('author', 'handle');

        const [userInfoResponse, userSubmissionsResponse, communityPosts] = await Promise.all([
            userInfoPromise,
            userSubmissionsPromise,
            communityPostsPromise
        ]);

        if (userInfoResponse.data.status !== 'OK' || userSubmissionsResponse.data.status !== 'OK') {
            return res.status(400).json({ msg: 'Error fetching data from Codeforces API' });
        }

        const allSubmissions = userSubmissionsResponse.data.result;
        const profileData = {
            info: userInfoResponse.data.result[0],
            submissions: allSubmissions.slice(0, 10),
            communityPosts: communityPosts,
        };

        res.json(profileData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const getProfileStats = async (req, res) => {
    const { handle } = req.params;
    try {
        const response = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
        const submissions = response.data.result;

        console.log(`Fetching stats for ${handle} - V2 (Rating Distribution)`);
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

                    // Count Tags
                    sub.problem.tags.forEach(tag => {
                        tags[tag] = (tags[tag] || 0) + 1;
                    });

                    // Count Difficulty (Rating Distribution)
                    if (sub.problem.rating) {
                        const rating = sub.problem.rating;
                        difficulty[rating] = (difficulty[rating] || 0) + 1;
                    }
                }
            }
        });

        res.status(200).json({ verdicts, tags, difficulty });
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

        // Fetch all submissions for the user
        const submissionsRes = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1000`);
        const submissions = submissionsRes.data.result;

        const solvedProblems = new Set();
        const tagFrequency = {};

        // Analyze solved problems
        submissions.forEach(sub => {
            if (sub.verdict === 'OK') {
                const problemId = `${sub.problem.contestId}${sub.problem.index}`;
                solvedProblems.add(problemId);
                sub.problem.tags.forEach(tag => {
                    tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
                });
            }
        });

        // Fetch the entire problemset
        const problemsetRes = await axios.get('https://codeforces.com/api/problemset.problems');
        const allProblems = problemsetRes.data.result.problems;

        // Filter for recommended problems
        const recommendations = allProblems.filter(problem => {
            const problemId = `${problem.contestId}${problem.index}`;
            const rating = problem.rating;

            // Conditions: Not solved, has a rating, and is within a suitable difficulty range
            return !solvedProblems.has(problemId) &&
                rating &&
                rating >= userRating &&
                rating <= userRating + 200;
        });

        // Sort recommendations to prioritize problems with tags the user has solved less often
        recommendations.sort((a, b) => {
            const scoreA = a.tags.reduce((sum, tag) => sum + (tagFrequency[tag] || 0), 0);
            const scoreB = b.tags.reduce((sum, tag) => sum + (tagFrequency[tag] || 0), 0);
            // A lower score means the user is less familiar with the tags, so we prioritize it
            return scoreA - scoreB;
        });

        // Return the top 10 recommendations
        res.json(recommendations.slice(0, 10));

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const getProfileInfo = async (req, res) => {
    const { handle } = req.params;
    try {
        const response = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
        if (response.data.status !== 'OK') {
            throw new Error('User not found on Codeforces');
        }
        res.status(200).json(response.data.result[0]);
    } catch (error) {
        res.status(404).json({ error: `Could not fetch info for handle: ${handle}` });
    }
};

export const getMyContests = async (req, res) => {
    try {
        const handle = req.user.handle;
        const contests = await Contest.find({ 'participants.handle': handle });
        res.status(200).json(contests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const getSubmissionStats = async (req, res) => {
    const { handle } = req.params;
    if (!handle) {
        return res.status(400).json({ message: 'User handle is required' });
    }

    try {
        const { data } = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);

        if (data.status !== 'OK') {
            return res.status(404).json({ message: 'Could not fetch submissions from Codeforces API.' });
        }

        // Process the data to get counts per day
        const submissionsByDate = data.result.reduce((acc, submission) => {
            // Convert UNIX timestamp to a YYYY-MM-DD string
            const date = new Date(submission.creationTimeSeconds * 1000).toISOString().split('T')[0];
            if (acc[date]) {
                acc[date]++;
            } else {
                acc[date] = 1;
            }
            return acc;
        }, {});

        // Convert the processed object to the array format the heatmap expects
        const heatmapData = Object.keys(submissionsByDate).map(date => ({
            date: date,
            count: submissionsByDate[date],
        }));

        res.status(200).json(heatmapData);

    } catch (error) {
        console.error('Error fetching submission stats:', error.message);
        res.status(500).json({ message: 'Server error while fetching submission stats.' });
    }
};