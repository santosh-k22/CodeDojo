import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema({
    problemId: { type: String, required: true },
    contestId: { type: Number, required: true },
    index: { type: String, required: true },
    name: { type: String, required: true },
    rating: { type: Number },
});

const ParticipantSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    handle: { type: String, required: true },
    joinTime: { type: Date, default: Date.now },
    submissions: [
        {
            problemIndex: String,
            verdict: String,
            submissionTime: Number, // Time in seconds from contest start
            isAccepted: Boolean,
            penalty: Number,
        },
    ],
});

const ContestSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        host: {
            type: String,
            required: true,
        },
        problems: [ProblemSchema],
        participants: [ParticipantSchema],
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

const Contest = mongoose.model('Contest', ContestSchema);

export default Contest;