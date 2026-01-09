import Post from './post.model.js';

const createPost = async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    try {
        const post = await Post.create({
            title,
            content,
            author: req.user._id,
        });
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({})
            .populate('author', 'handle rating')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

const votePost = async (req, res) => {
    const { postId } = req.params;
    const { voteType } = req.body;
    const userId = req.user._id;

    if (!['up', 'down'].includes(voteType)) {
        return res.status(400).json({ error: 'Invalid vote type' });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const isUpvoted = post.upvotedBy.some(id => id.equals(userId));
        const isDownvoted = post.downvotedBy.some(id => id.equals(userId));

        let update = {};

        if (voteType === 'up') {
            if (isUpvoted) {
                // Toggle off
                update = { $pull: { upvotedBy: userId } };
            } else {
                // Remove downvote if exists, add upvote
                update = {
                    $pull: { downvotedBy: userId },
                    $addToSet: { upvotedBy: userId }
                };
            }
        } else {
            // Downvote
            if (isDownvoted) {
                // Toggle off
                update = { $pull: { downvotedBy: userId } };
            } else {
                // Remove upvote if exists, add downvote
                update = {
                    $pull: { upvotedBy: userId },
                    $addToSet: { downvotedBy: userId }
                };
            }
        }

        const updatedPost = await Post.findByIdAndUpdate(postId, update, { new: true });

        updatedPost.votes = updatedPost.upvotedBy.length - updatedPost.downvotedBy.length;
        await updatedPost.save(); // Save the calculated field

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to vote on post' });
    }
};

const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).populate('author', 'handle rating');
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
};

const deletePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (!post.author.equals(userId)) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        await post.deleteOne();
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
};

export { createPost, getPosts, getPostById, votePost, deletePost };