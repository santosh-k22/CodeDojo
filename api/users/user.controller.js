import User from './user.model.js';

const searchUsers = async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    try {
        const users = await User.find({
            handle: { $regex: query, $options: 'i' },
        }).select('handle rating rank'); // Only send back public info
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search for users' });
    }
};

const findUserByHandle = async (req, res) => {
    try {
        const user = await User.findOne({ handle: req.params.handle }).select('_id handle'); // Minimal fields for existence check
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error while finding user' });
    }
};

export {
    searchUsers,
    findUserByHandle
};
