import axios from 'axios';
import cache from '../utils/cache.js';

const CF_API_URL = 'https://codeforces.com/api';

class CodeforcesService {
    async getProblemSet() {
        const cacheKey = 'problemset';
        const cachedProblems = cache.get(cacheKey);

        if (cachedProblems) return cachedProblems;

        try {
            const response = await axios.get(`${CF_API_URL}/problemset.problems`, { timeout: 10000 });
            if (response.data.status !== 'OK') {
                throw new Error('Codeforces API returned error for problemset');
            }

            const problems = response.data.result.problems;
            cache.set(cacheKey, problems, 3600);
            return problems;
        } catch (error) {
            throw error;
        }
    }

    async getUserSubmissions(handle, from = 1, count = 1000) {
        try {
            const response = await axios.get(`${CF_API_URL}/user.status`, {
                params: { handle, from, count },
                timeout: 10000
            });

            if (response.data.status !== 'OK') {
                throw new Error(`Codeforces API error for user status: ${handle}`);
            }

            return response.data.result;
        } catch (error) {
            throw new Error(`Failed to fetch submissions for ${handle}`);
        }
    }

    async getUserInfo(handle) {
        try {
            const response = await axios.get(`${CF_API_URL}/user.info`, {
                params: { handles: handle },
                timeout: 10000
            });

            if (response.data.status !== 'OK') {
                throw new Error(`Codeforces API error for user info: ${handle}`);
            }

            return response.data.result[0];
        } catch (error) {
            throw new Error(`Failed to fetch info for ${handle}`);
        }
    }

    async getContestsList(gym = false) {
        const cacheKey = `cf_contests_${gym}`;
        const cachedContests = cache.get(cacheKey);
        if (cachedContests) return cachedContests;

        try {
            const response = await axios.get(`${CF_API_URL}/contest.list`, {
                params: { gym },
                timeout: 10000
            });

            if (response.data.status !== 'OK') {
                throw new Error('Codeforces API error for contest list');
            }

            const contests = response.data.result;
            // Cache for 5 minutes
            cache.set(cacheKey, contests, 300);
            return contests;
        } catch (error) {
            console.error('Error fetching contests:', error.message);
            throw error;
        }
    }
}

export default new CodeforcesService();
