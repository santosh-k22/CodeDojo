import User from './user.model.js';

const findUserByHandle = async (req, res) => {
    try {
        const user = await User.findOne({ handle: req.params.handle }).select('_id handle');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error while finding user' });
    }
};

const getFriendsData = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friends', 'handle rating');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ friends: user.friends });
    } catch (error) {
        res.status(500).json({ error: 'Server error with friends data' });
    }
};

const toggleFollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user._id;

        if (currentUserId.equals(targetUserId)) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        const user = await User.findById(currentUserId);
        const isFollowing = user.friends.some(id => id.toString() === targetUserId);

        if (isFollowing) {
            await User.findByIdAndUpdate(currentUserId, { $pull: { friends: targetUserId } });
        } else {
            await User.findByIdAndUpdate(currentUserId, { $addToSet: { friends: targetUserId } });
        }

        res.status(200).json({
            message: isFollowing ? 'Unfollowed' : 'Followed',
            isFollowing: !isFollowing
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error while toggling friend' });
    }
};

export {
    findUserByHandle,
    getFriendsData,
    toggleFollowUser
};
