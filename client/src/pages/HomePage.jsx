import { useContext } from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../app/AuthContext';
import { Trophy, Users, MessageSquare, ShieldCheck } from 'lucide-react'; // Import icons

const HomePage = () => {
    const { user } = useContext(AuthContext);

    const features = [
        {
            icon: Trophy,
            title: 'Live Contests',
            text: 'Compete in real-time against others and climb the leaderboard.'
        },

        {
            icon: MessageSquare,
            title: 'Community Driven',
            text: 'Discuss problems, share solutions, and learn from the community.'
        },
        {
            icon: ShieldCheck,
            title: 'Verification',
            text: 'Our unique challenge-based verification ensures user authenticity.'
        }
    ];

    return (
        <>
            {/* --- Hero Section --- */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '5rem 0' }}>
                <Container className="text-center">
                    <h1 className="display-4 fw-bold">Welcome to CodeDojo</h1>
                    <p className="fs-4" style={{ color: 'var(--text-secondary)' }}>
                        Your arena to sharpen skills, compete with peers, and conquer challenges.
                    </p>
                    <div className="mt-4">
                        {user ? (
                            <Link to="/dashboard">
                                <Button variant="primary" size="lg">Go to Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="me-2">
                                    <Button variant="primary" size="lg">Get Started</Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="outline-secondary" size="lg">Login</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </Container>
            </div>

            {/* --- Features Section --- */}
            <Container className="py-5">
                <h2 className="text-center mb-5">Why CodeDojo?</h2>
                <Row>
                    {features.map((feature, index) => (
                        <Col key={index} md={6} lg={3} className="mb-4">
                            <Card className="h-100 text-center">
                                <Card.Body>
                                    <div className="mb-3">
                                        <feature.icon size={48} style={{ color: 'var(--accent-secondary)' }} />
                                    </div>
                                    <Card.Title>{feature.title}</Card.Title>
                                    <Card.Text style={{ color: 'var(--text-secondary)' }}>
                                        {feature.text}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    );
};

export default HomePage;