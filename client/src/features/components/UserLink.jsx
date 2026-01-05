import { Link } from 'react-router-dom';
import { getHandleColor } from '../../utils/codeforcesColors';

const UserLink = ({ handle, rating, fontWeight = 'bold', className = '', isExternal = false }) => {
    if (!handle) return null;

    if (isExternal) {
        return (
            <a
                href={`https://codeforces.com/profile/${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: getHandleColor(rating), fontWeight }}
                className={className}
            >
                {handle}
            </a>
        );
    }

    return (
        <Link
            to={`/profile/${handle}`}
            style={{ color: getHandleColor(rating), fontWeight }}
            className={className}
        >
            {handle}
        </Link>
    );
};

export default UserLink;
