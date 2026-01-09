import { useState, useEffect } from 'react';
import { Container, Spinner, Alert, ListGroup, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../app/api';
import { Users } from 'lucide-react';
import UserLink from '../features/components/UserLink';
import UserSearch from '../features/components/UserSearch';

const FriendsPage = () => {
    const [friends, setFriends] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFriends = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/users/friends');
            setFriends(data.friends);
        } catch {
            setError('Could not load your following list.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    if (isLoading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container className="py-4">
            <h2 className="mb-4">Following</h2>

            {/* User Search Section */}
            <Card className="mb-4">
                <Card.Header>Find User</Card.Header>
                <Card.Body>
                    <p className="text-muted small mb-2">Enter a Codeforces user handle to view their profile and follow them.</p>
                    <UserSearch />
                </Card.Body>
            </Card>

            <h4 className="mb-3">People you follow</h4>
            <Card>
                <ListGroup variant="flush">
                    {friends.length > 0 ? friends.map(friend => (
                        <ListGroup.Item key={friend._id} className="d-flex align-items-center justify-content-between">
                            <UserLink handle={friend.handle} rating={friend.rating} />
                            <Link to={`/profile/${friend.handle}`}>
                                <Button size="sm" variant="outline-primary">View Profile</Button>
                            </Link>
                        </ListGroup.Item>
                    )) : (
                        <div className="text-center p-5">
                            <Users size={64} className="text-muted" />
                            <h4 className="mt-3">Not Following Anyone</h4>
                            <p className="text-muted">Enter a handle above to visit their profile and follow them.</p>
                        </div>
                    )}
                </ListGroup>
            </Card>
        </Container>
    );
};

export default FriendsPage;