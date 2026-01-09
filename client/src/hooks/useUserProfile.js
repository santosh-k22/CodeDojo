import { useState, useEffect, useCallback } from 'react';
import api from '../app/api';

const useUserProfile = (handle) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProfile = useCallback(async (targetHandle) => {
        if (!targetHandle) return;

        setLoading(true);
        setError(null);
        try {
            const [statsRes, infoRes] = await Promise.all([
                api.get(`/profile/stats/${targetHandle}?t=${Date.now()}`),
                api.get(`/profile/info/${targetHandle}`)
            ]);

            setData({
                stats: statsRes.data,
                info: infoRes.data.info,
                submissions: infoRes.data.submissions
            });
        } catch (err) {
            console.error("Profile fetch error:", err);
            setError(err);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (handle) {
            fetchProfile(handle);
        } else {
            setData(null);
            setError(null);
        }
    }, [handle, fetchProfile]);

    return { data, loading, error, refetch: () => fetchProfile(handle) };
};

export default useUserProfile;
