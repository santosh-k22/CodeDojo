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
            .populate('author', 'handle rating') // Replace author ID with user object (handle + rating)
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

const votePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const votedIndex = post.votedBy.findIndex(id => id.equals(userId));

        if (votedIndex > -1) {
            post.votes -= 1;
            post.votedBy.splice(votedIndex, 1);
        } else {
            post.votes += 1;
            post.votedBy.push(userId);
        }

        await post.save();
        res.status(200).json(post);
    } catch (error) {
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