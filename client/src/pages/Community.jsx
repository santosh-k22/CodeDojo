import { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Form, Spinner, Alert, Collapse } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../app/api';
import moment from 'moment';
import { AuthContext } from '../app/AuthContext';
import { MessageSquarePlus, Trash2 } from 'lucide-react';
import UserLink from '../features/components/UserLink';
import VoteControl from '../features/components/VoteControl';

const Community = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useContext(AuthContext);

    const fetchPosts = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/community');
            setPosts(data);
        } catch {
            setError('Could not fetch community posts.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to create a post.');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.post('/community', { title, content });
            setTitle('');
            setContent('');
            setShowForm(false);
            fetchPosts(); // Refresh posts list
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create post.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/community/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
        } catch {
            setError('Failed to delete post.');
        }
    };

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Community Forum</h2>
                <Button onClick={() => setShowForm(!showForm)} aria-controls="create-post-form" aria-expanded={showForm}>
                    <MessageSquarePlus className="me-2" />
                    {showForm ? 'Cancel' : 'Create Post'}
                </Button>
            </div>

            <Collapse in={showForm}>
                <div id="create-post-form">
                    <Card className="mb-4">
                        <Card.Body>
                            <Form onSubmit={handleCreatePost}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Content</Form.Label>
                                    <Form.Control as="textarea" rows={3} value={content} onChange={(e) => setContent(e.target.value)} required />
                                </Form.Group>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Spinner size="sm" /> : 'Submit Post'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </Collapse>

            {error && <Alert variant="danger">{error}</Alert>}
            {isLoading && <div className="text-center"><Spinner /></div>}

            {!isLoading && posts.length > 0 ? (
                posts.map(post => (
                    <Card key={post._id} className="mb-3">
                        <Card.Body className="d-flex">
                            <VoteControl post={post} />
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start">
                                    <Card.Title>
                                        <Link to={`/community/${post._id}`}>{post.title}</Link>
                                    </Card.Title>
                                    {user && user.handle === post.author.handle && (
                                        <Button variant="link" className="text-danger p-0" onClick={() => handleDeletePost(post._id)}>
                                            <Trash2 size={18} />
                                        </Button>
                                    )}
                                </div>
                                <Card.Subtitle className="mb-2 text-muted">
                                    Posted by <UserLink handle={post.author.handle} rating={post.author.rating} /> - {moment(post.createdAt).fromNow()}
                                </Card.Subtitle>
                                <Card.Text>
                                    {post.content.substring(0, 200)}...
                                </Card.Text>
                                <Link to={`/community/${post._id}`}>View Post</Link>
                            </div>
                        </Card.Body>
                    </Card>
                ))
            ) : (
                !isLoading && <Alert variant="info">No posts yet. Be the first to start a discussion!</Alert>
            )}
        </Container>
    );
};

export default Community;