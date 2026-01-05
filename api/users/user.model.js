import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        handle: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        rank: {
            type: String,
        },
        rating: {
            type: Number,
        },
        maxRank: {
            type: String,
        },
        maxRating: {
            type: Number,
        },
        friends: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        friendRequests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        sentFriendRequests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
        ],
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

export default User;
