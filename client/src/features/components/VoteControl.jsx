import { useState, useContext } from 'react';
import { Button } from 'react-bootstrap';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import api from '../../app/api';
import { AuthContext } from '../../app/AuthContext';

const VoteControl = ({ post, onVoteChange }) => {
    const { user } = useContext(AuthContext);
    const [votes, setVotes] = useState(post.votes);
    const [userVote, setUserVote] = useState(() => {
        if (!user) return null;
        if (post.upvotedBy.includes(user._id)) return 'up';
        if (post.downvotedBy.includes(user._id)) return 'down';
        return null;
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleVote = async (voteType) => {
        if (!user) {
            setError('Login required');
            setTimeout(() => setError(null), 2000);
            return;
        }
        if (isLoading) return;

        // Optimistic update
        const previousVotes = votes;
        const previousUserVote = userVote;

        let newVotes = votes;
        let newUserVote = userVote;

        if (voteType === 'up') {
            if (userVote === 'up') {
                newVotes -= 1;
                newUserVote = null;
            } else if (userVote === 'down') {
                newVotes += 2;
                newUserVote = 'up';
            } else {
                newVotes += 1;
                newUserVote = 'up';
            }
        } else {
            if (userVote === 'down') {
                newVotes += 1;
                newUserVote = null;
            } else if (userVote === 'up') {
                newVotes -= 2;
                newUserVote = 'down';
            } else {
                newVotes -= 1;
                newUserVote = 'down';
            }
        }

        setVotes(newVotes);
        setUserVote(newUserVote);
        setIsLoading(true);
        setError(null);

        try {
            const { data } = await api.post(`/community/${post._id}/vote`, { voteType });
            setVotes(data.votes);

            if (data.upvotedBy.includes(user._id)) setUserVote('up');
            else if (data.downvotedBy.includes(user._id)) setUserVote('down');
            else setUserVote(null);

            if (onVoteChange) onVoteChange(data);
        } catch {
            // Revert on error
            setVotes(previousVotes);
            setUserVote(previousUserVote);
            setError('Failed');
            setTimeout(() => setError(null), 2000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column align-items-center me-3">
            <Button
                variant="link"
                className={`p-0 ${userVote === 'up' ? 'text-primary' : 'text-muted'}`}
                onClick={(e) => { e.preventDefault(); handleVote('up'); }}
            >
                <ArrowBigUp size={28} fill={userVote === 'up' ? 'currentColor' : 'none'} />
            </Button>

            <span className="fw-bold my-1">{votes}</span>

            <Button
                variant="link"
                className={`p-0 ${userVote === 'down' ? 'text-danger' : 'text-muted'}`}
                onClick={(e) => { e.preventDefault(); handleVote('down'); }}
            >
                <ArrowBigDown size={28} fill={userVote === 'down' ? 'currentColor' : 'none'} />
            </Button>
            {error && <small className="text-danger" style={{ fontSize: '0.65rem' }}>{error}</small>}
        </div>
    );
};

export default VoteControl;
