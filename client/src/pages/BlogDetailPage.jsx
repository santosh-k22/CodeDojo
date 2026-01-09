import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Button, Form, Spinner, Alert, ListGroup } from 'react-bootstrap';
import api from '../app/api';
import moment from 'moment';
import { AuthContext } from '../app/AuthContext';
import VoteControl from '../features/components/VoteControl';

const BlogDetailPage = () => {
    const { id } = useParams();

    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const { data } = await api.get(`/community/${id}`);
                setPost(data);
            } catch {
                setError('Could not fetch the post.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (isLoading) return <Container className="text-center mt-5"><Spinner /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!post) return null;

    return (
        <Container className="py-4">
            <Card>
                <Card.Header>
                    <h2>{post.title}</h2>
                    <p className="text-muted mb-0">
                        Posted by <Link to={`/profile/${post.author.handle}`}>{post.author.handle}</Link> - {moment(post.createdAt).fromNow()}
                    </p>
                </Card.Header>
                <Card.Body>
                    <div className="d-flex">
                        <VoteControl post={post} />
                        <Card.Text style={{ whiteSpace: 'pre-wrap' }} className="flex-grow-1 ms-3">{post.content}</Card.Text>
                    </div>
                </Card.Body>
            </Card>


        </Container>
    );
};

export default BlogDetailPage;