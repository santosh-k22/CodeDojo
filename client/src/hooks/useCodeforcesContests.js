import { useState, useEffect } from 'react';
import api from '../app/api';

const useCodeforcesContests = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContests = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/contests/external');
                setContests(data);
            } catch (err) {
                console.error("Failed to fetch Codeforces contests via backend", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchContests();
    }, []);

    return { contests, loading, error };
};

export default useCodeforcesContests;
