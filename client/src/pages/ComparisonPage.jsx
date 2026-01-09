import { useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert, Card } from 'react-bootstrap';
import VerdictChart from '../features/components/VerdictChart';
import DifficultyChart from '../features/components/DifficultyChart';
import TagsChart from '../features/components/TagsChart';
import UserStatCard from '../features/components/UserStatCard';
import SubmissionHeatmap from '../features/components/SubmissionHeatmap';
import UserSearch from '../features/components/UserSearch';
import { Award, Star, BarChart3, TrendingUp } from 'lucide-react';
import useUserProfile from '../hooks/useUserProfile';

const ComparisonPage = () => {
    const [handle1, setHandle1] = useState(null);
    const [handle2, setHandle2] = useState(null);

    const user1 = useUserProfile(handle1);
    const user2 = useUserProfile(handle2);

    const isLoading = user1.loading || user2.loading;
    const error = user1.error || user2.error ? 'Failed to fetch data for one or more users.' : null;

    const handleUserFound = (slot, handle) => {
        if (slot === 1) setHandle1(handle);
        if (slot === 2) setHandle2(handle);
    };



    const renderUserStats = (data) => (
        <>
            <Row className="mb-4">
                <Col md={6} className="mb-2"><UserStatCard title="Rank" value={data.info.rank || 'N/A'} icon={Award} /></Col>
                <Col md={6} className="mb-2"><UserStatCard title="Rating" value={data.info.rating || 'N/A'} icon={Star} /></Col>
                <Col md={6} className="mb-2"><UserStatCard title="Max Rating" value={data.info.maxRating || 'N/A'} icon={BarChart3} /></Col>
                <Col md={6} className="mb-2"><UserStatCard title="Contribution" value={data.info.contribution || 0} icon={TrendingUp} /></Col>
            </Row>
            <Card className="mb-4">
                <Card.Header>Verdict Distribution</Card.Header>
                <Card.Body><VerdictChart data={data.stats.verdicts} /></Card.Body>
            </Card>
            <Card className="mb-4">
                <Card.Header>Rating Distribution</Card.Header>
                <Card.Body><DifficultyChart data={data.stats.difficulty || {}} /></Card.Body>
            </Card>
            <Card className="mb-4">
                <Card.Header>Top Tags</Card.Header>
                <Card.Body><TagsChart data={data.stats.tags} /></Card.Body>
            </Card>
            <Card>
                <Card.Header>Activity</Card.Header>
                <Card.Body><SubmissionHeatmap userId={data.info.handle} /></Card.Body>
            </Card>
        </>
    );

    return (
        <Container className="mt-4">
            <h2 className="mb-4 text-center">Compare Users</h2>

            <Row className="mb-4">
                <Col md={6} className="mb-3 mb-md-0">
                    <Card className={handle1 ? "border-primary" : ""}>
                        <Card.Header className={handle1 ? "bg-primary text-white d-flex justify-content-between align-items-center" : ""}>
                            <span>{handle1 ? handle1 : "User 1"}</span>
                            {handle1 && <Button variant="light" size="sm" onClick={() => setHandle1(null)} style={{ fontSize: '0.7em', padding: '2px 8px' }}>Change</Button>}
                        </Card.Header>
                        <Card.Body>
                            {!handle1 ? (
                                <UserSearch
                                    disableRedirect={true}
                                    checkGlobal={true}
                                    onUserFound={(h) => handleUserFound(1, h)}
                                    placeholder="Search User 1..."
                                />
                            ) : (
                                <div className="text-center text-success fw-bold">Selected</div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className={handle2 ? "border-primary" : ""}>
                        <Card.Header className={handle2 ? "bg-primary text-white d-flex justify-content-between align-items-center" : ""}>
                            <span>{handle2 ? handle2 : "User 2"}</span>
                            {handle2 && <Button variant="light" size="sm" onClick={() => setHandle2(null)} style={{ fontSize: '0.7em', padding: '2px 8px' }}>Change</Button>}
                        </Card.Header>
                        <Card.Body>
                            {!handle2 ? (
                                <UserSearch
                                    disableRedirect={true}
                                    checkGlobal={true}
                                    onUserFound={(h) => handleUserFound(2, h)}
                                    placeholder="Search User 2..."
                                />
                            ) : (
                                <div className="text-center text-success fw-bold">Selected</div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {isLoading && <div className="text-center py-5"><Spinner animation="border" /></div>}

            {error && <Alert variant="danger">{error}</Alert>}

            {!isLoading && !user1.data && !user2.data && (
                <Alert variant="info" className="text-center">Enter two handles to see a side-by-side comparison.</Alert>
            )}

            {user1.data && user2.data && (
                <Row>
                    <Col lg={6}>
                        <h3 className="text-center mb-3">{user1.data.info.handle}</h3>
                        {renderUserStats(user1.data)}
                    </Col>
                    <Col lg={6}>
                        <h3 className="text-center mb-3">{user2.data.info.handle}</h3>
                        {renderUserStats(user2.data)}
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default ComparisonPage;