import User from '../users/user.model.js';

export const getFriendsData = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('friends', 'handle rating')
            .populate('friendRequests', 'handle rating')
            .populate('sentFriendRequests', 'handle rating');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            friends: user.friends,
            friendRequests: user.friendRequests,
            sentFriendRequests: user.sentFriendRequests,
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error while fetching friends data' });
    }
};

export const sendFriendRequest = async (req, res) => {
    try {
        const sender = await User.findById(req.user._id);
        const recipient = await User.findById(req.params.recipientId);

        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }
        if (sender._id.equals(recipient._id)) {
            // Prevent sending friend request to self
            return res.status(400).json({ error: 'You cannot send a friend request to yourself' });
        }
        if (sender.friends.includes(recipient._id) || recipient.friendRequests.includes(sender._id)) {
            return res.status(400).json({ error: 'Friend request already sent or you are already friends' });
        }

        recipient.friendRequests.push(sender._id);
        sender.sentFriendRequests.push(recipient._id);

        await recipient.save();
        await sender.save();

        res.status(200).json({ message: 'Friend request sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error while sending friend request' });
    }
};

export const acceptFriendRequest = async (req, res) => {
    try {
        const recipient = await User.findById(req.user._id); // The one accepting
        const sender = await User.findById(req.params.senderId);

        if (!sender || !recipient.friendRequests.includes(sender._id)) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        recipient.friends.push(sender._id);
        sender.friends.push(recipient._id);

        recipient.friendRequests = recipient.friendRequests.filter(id => !id.equals(sender._id));
        sender.sentFriendRequests = sender.sentFriendRequests.filter(id => !id.equals(recipient._id));

        await recipient.save();
        await sender.save();

        res.status(200).json({ message: 'Friend request accepted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error while accepting friend request' });
    }
};

export const rejectFriendRequest = async (req, res) => {
    try {
        const recipient = await User.findById(req.user._id);
        const sender = await User.findById(req.params.senderId);

        if (!sender) {
            return res.status(404).json({ error: 'Sender not found' });
        }

        recipient.friendRequests = recipient.friendRequests.filter(id => !id.equals(sender._id));
        sender.sentFriendRequests = sender.sentFriendRequests.filter(id => !id.equals(recipient._id));

        await recipient.save();
        await sender.save();

        res.status(200).json({ message: 'Friend request rejected' });
    } catch (error) {
        res.status(500).json({ error: 'Server error while rejecting friend request' });
    }
};