/**
 * Returns the Codeforces color class/hex based on rating.
 * @param {number} rating 
 * @returns {string} Hex color
 */
export const getHandleColor = (rating) => {
    if (!rating) return '#000000'; // Black (Unrated)
    if (rating < 1200) return '#9ca3af'; // Grey (Newbie)
    if (rating < 1400) return '#10b981'; // Green (Pupil)
    if (rating < 1600) return '#06b6d4'; // Cyan (Specialist)
    if (rating < 1900) return '#3b82f6'; // Blue (Expert)
    if (rating < 2100) return '#a855f7'; // Violet (Candidate Master)
    if (rating < 2300) return '#f59e0b'; // Orange (Master)
    if (rating < 2400) return '#f97316'; // Orange (International Master)
    if (rating < 2600) return '#ef4444'; // Red (Grandmaster)
    if (rating < 3000) return '#b91c1c'; // Red (International Grandmaster)
    return '#7f1d1d'; // Legendary Grandmaster
};

/**
 * Returns a rank title based on rating
 */
export const getRankTitle = (rating) => {
    if (!rating) return 'Unrated';
    if (rating < 1200) return 'Newbie';
    if (rating < 1400) return 'Pupil';
    if (rating < 1600) return 'Specialist';
    if (rating < 1900) return 'Expert';
    if (rating < 2100) return 'Candidate Master';
    if (rating < 2300) return 'Master';
    if (rating < 2400) return 'International Master';
    if (rating < 2600) return 'Grandmaster';
    if (rating < 3000) return 'International Grandmaster';
    return 'Legendary Grandmaster';
}
