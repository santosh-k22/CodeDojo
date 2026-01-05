import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
    handle: {
        type: String,
        required: true,
    },
    problemName: {
        type: String,
        required: true,
    },
    problemUrl: {
        type: String,
        required: true,
    },
    contestId: {
        type: String,
        required: true,
    },
    problemIndex: {
        type: String,
        required: true,
    },
    uniqueString: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '10m', // The challenge will expire in 10 minutes
    },
});

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;