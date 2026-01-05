import { useState, useEffect, useContext } from 'react';
import { Container, Button, Spinner, Alert, ListGroup, Tab, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../app/api';
import { AuthContext } from '../app/AuthContext';
import { Users, UserPlus, Send } from 'lucide-react';
import UserLink from '../features/components/UserLink';

const FriendsPage = () => {
    const { user } = useContext(AuthContext);
    const [friendsData, setFriendsData] = useState({ friends: [], friendRequests: [], sentFriendRequests: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFriendsData = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/friends');
            setFriendsData(data);
        } catch (err) {
            setError('Could not load your friends data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFriendsData();
    }, []);

    const handleAcceptRequest = async (senderId) => {
        try {
            await api.post(`/friends/accept/${senderId}`);
            fetchFriendsData(); // Refresh the lists
        } catch (err) {
            setError('Failed to accept friend request.');
        }
    };

    const handleRejectRequest = async (senderId) => {
        try {
            await api.post(`/friends/reject/${senderId}`);
            fetchFriendsData(); // Refresh the lists
        } catch (err) {
            setError('Failed to reject friend request.');
        }
    };

    const renderEmptyState = (icon, title, text) => {
        const Icon = icon;
        return (
            <div className="text-center p-5">
                <Icon size={64} className="text-muted" />
                <h4 className="mt-3">{title}</h4>
                <p className="text-muted">{text}</p>
            </div>
        );
    };

    if (isLoading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container className="py-4">
            <h2>Friends</h2>
            <Tab.Container id="friends-tabs" defaultActiveKey="friends">
                <Nav variant="pills" className="mb-3">
                    <Nav.Item>
                        <Nav.Link eventKey="friends">My Friends ({friendsData.friends.length})</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="requests">Pending Requests ({friendsData.friendRequests.length})</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="sent">Sent Requests ({friendsData.sentFriendRequests.length})</Nav.Link>
                    </Nav.Item>
                </Nav>
                <Tab.Content>
                    <Tab.Pane eventKey="friends">
                        <ListGroup>
                            {friendsData.friends.length > 0 ? friendsData.friends.map(friend => (
                                <ListGroup.Item key={friend._id}>
                                    <UserLink handle={friend.handle} rating={friend.rating} />
                                </ListGroup.Item>
                            )) : renderEmptyState(Users, "No Friends Yet", "Search for users to connect with.")}
                        </ListGroup>
                    </Tab.Pane>
                    <Tab.Pane eventKey="requests">
                        <ListGroup>
                            {friendsData.friendRequests.length > 0 ? friendsData.friendRequests.map(request => (
                                <ListGroup.Item key={request._id} className="d-flex justify-content-between align-items-center">
                                    <Link to={`/profile/${request.handle}`}>{request.handle}</Link>
                                    <div>
                                        <Button variant="success" size="sm" className="me-2" onClick={() => handleAcceptRequest(request._id)}>Accept</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleRejectRequest(request._id)}>Reject</Button>
                                    </div>
                                </ListGroup.Item>
                            )) : renderEmptyState(UserPlus, "No Pending Requests", "You have no incoming friend requests.")}
                        </ListGroup>
                    </Tab.Pane>
                    <Tab.Pane eventKey="sent">
                        <ListGroup>
                            {friendsData.sentFriendRequests.length > 0 ? friendsData.sentFriendRequests.map(sent => (
                                <ListGroup.Item key={sent._id} className="text-muted">
                                    <Link to={`/profile/${sent.handle}`}>{sent.handle}</Link> (Pending)
                                </ListGroup.Item>
                            )) : renderEmptyState(Send, "No Sent Requests", "You have not sent any friend requests.")}
                        </ListGroup>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </Container>
    );
};

export default FriendsPage;