import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Table, Form, Tabs, Tab, Badge } from 'react-bootstrap';
import api from '../app/api';
import moment from 'moment';
import Countdown from 'react-countdown';
import { AuthContext } from '../app/AuthContext';
import { Clock, Users, ListChecks } from 'lucide-react';
import UserLink from '../features/components/UserLink';

const ContestDetailPage = () => {
    const { slug } = useParams();
    const { user } = useContext(AuthContext);
    const [contest, setContest] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isHost, setIsHost] = useState(false);

    const [isRefreshing, setIsRefreshing] = useState(false);

    // State for Admin Forms
    const [rating, setRating] = useState(1200);
    const [count, setCount] = useState(1);
    const [problemUrl, setProblemUrl] = useState('');
    const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);
    const [adminError, setAdminError] = useState('');

    const fetchContestData = async () => {
        try {
            const contestRes = await api.get(`/contests/slug/${slug}`);
            const contestData = contestRes.data;
            setContest(contestData);

            if (user) {
                setIsHost(contestData.host === user.handle);
            }

            const leaderboardRes = await api.get(`/contests/slug/${slug}/leaderboard`);
            setLeaderboard(leaderboardRes.data);
            setError(null); // Clear previous errors on success

        } catch (err) {
            setError('Failed to fetch contest details.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContestData();
    }, [slug, user]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchContestData();
        setIsRefreshing(false);
    };

    const handleJoinContest = async () => {
        try {
            await api.post(`/contests/slug/${slug}/join`);
            fetchContestData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to join contest.');
        }
    };

    const handleAddRandomProblems = async (e) => {
        e.preventDefault();
        setAdminError('');
        setIsSubmittingAdmin(true);
        try {
            await api.post(`/contests/${contest._id}/add-random`, { rating, count });
            fetchContestData();
        } catch (err) {
            setAdminError(err.response?.data?.error || 'Failed to add random problems.');
        } finally {
            setIsSubmittingAdmin(false);
        }
    };

    const handleAddManualProblem = async (e) => {
        e.preventDefault();
        setAdminError('');
        setIsSubmittingAdmin(true);
        try {
            await api.post(`/contests/${contest._id}/add-manual`, { problemUrl });
            setProblemUrl('');
            fetchContestData();
        } catch (err) {
            setAdminError(err.response?.data?.error || 'Failed to add problem by URL.');
        } finally {
            setIsSubmittingAdmin(false);
        }
    };

    const getStatus = (c) => {
        const now = moment();
        const startTime = moment(c.startTime);
        const endTime = moment(c.endTime);
        if (now.isBefore(startTime)) return { text: 'Upcoming', variant: 'info', countdownTarget: c.startTime };
        if (now.isAfter(endTime)) return { text: 'Finished', variant: 'secondary' };
        return { text: 'Live', variant: 'success', countdownTarget: c.endTime };
    };

    if (isLoading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!contest) return null;

    const status = getStatus(contest);
    const isParticipant = user && contest.participants.some(p => p.handle === user.handle);

    return (
        <Container className="py-4">
            <Card className="mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                        <div className="text-center flex-grow-1">
                            <Badge bg={status.variant} className="mb-2">{status.text}</Badge>
                            <h1 className="mb-1">{contest.name}</h1>
                            <p className="text-muted">Hosted by {contest.host}</p>
                            {status.countdownTarget && (
                                <div className="fs-4 my-3">
                                    <Clock size={20} className="me-2" />
                                    <Countdown date={status.countdownTarget} />
                                </div>
                            )}
                        </div>
                        <div>
                            <Button variant="outline-secondary" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                                {isRefreshing ? <Spinner as="span" animation="border" size="sm" /> : 'Refresh'}
                            </Button>
                        </div>
                    </div>
                    {!isParticipant && status.text !== 'Finished' && (
                        <div className="text-center">
                            <Button variant="primary" size="lg" onClick={handleJoinContest}>Join Contest</Button>
                        </div>
                    )}
                    {isParticipant && <p className="text-success fw-bold mt-3 text-center">You have joined this contest!</p>}
                </Card.Body>
            </Card>

            <Tabs defaultActiveKey="problems" id="contest-details-tabs" className="mb-3" fill>
                <Tab eventKey="problems" title={<><ListChecks className="me-2" />Problems</>}>
                    {contest.problems.length > 0 ? (
                        <Table striped hover responsive>
                            <thead>
                                <tr><th>#</th><th>Problem Name</th><th>Rating</th><th>Link</th></tr>
                            </thead>
                            <tbody>
                                {contest.problems.map((prob, index) => (
                                    <tr key={prob.problemId}>
                                        <td>{String.fromCharCode(65 + index)}</td>
                                        <td>{prob.name}</td>
                                        <td>{prob.rating || 'N/A'}</td>
                                        <td>
                                            <a href={`https://codeforces.com/contest/${prob.contestId}/problem/${prob.index}`} target="_blank" rel="noopener noreferrer">
                                                Solve Problem
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : <Alert variant="info">No problems have been added to this contest yet.</Alert>}
                </Tab>

                <Tab eventKey="leaderboard" title={<><Users className="me-2" />Leaderboard</>}>
                    {leaderboard.length > 0 ? (
                        <Table striped hover responsive>
                            <thead>
                                <tr><th>Rank</th><th>User</th><th>Score</th><th>Penalty</th></tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((entry, index) => (
                                    <tr key={entry.handle}>
                                        <td>{index + 1}</td>
                                        <td><UserLink handle={entry.handle} rating={entry.rating} isExternal /></td>
                                        <td>{entry.score}</td>
                                        <td>{moment.utc(entry.penalty * 1000).format('HH:mm:ss')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : <Alert variant="info">The leaderboard is empty.</Alert>}
                </Tab>
            </Tabs>

            {isHost && (
                <Row className="mt-5">
                    <Col>
                        <Card>
                            <Card.Header as="h5">Admin Controls</Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <h6>Add Random Problems</h6>
                                        <Form onSubmit={handleAddRandomProblems}>
                                            <Form.Group className="mb-2"><Form.Label>Rating</Form.Label><Form.Control type="number" step="100" value={rating} onChange={e => setRating(parseInt(e.target.value))} /></Form.Group>
                                            <Form.Group className="mb-2"><Form.Label>Count</Form.Label><Form.Control type="number" min="1" max="5" value={count} onChange={e => setCount(parseInt(e.target.value))} /></Form.Group>
                                            <Button type="submit" size="sm" disabled={isSubmittingAdmin}>
                                                {isSubmittingAdmin ? <Spinner size="sm" /> : 'Add Random'}
                                            </Button>
                                        </Form>
                                    </Col>
                                    <Col md={6}>
                                        <h6>Add Problem by URL</h6>
                                        <Form onSubmit={handleAddManualProblem}>
                                            <Form.Group className="mb-2"><Form.Label>Codeforces URL</Form.Label><Form.Control type="text" placeholder="Enter problem URL" value={problemUrl} onChange={e => setProblemUrl(e.target.value)} /></Form.Group>
                                            <Button type="submit" size="sm" disabled={isSubmittingAdmin}>
                                                {isSubmittingAdmin ? <Spinner size="sm" /> : 'Add Manual'}
                                            </Button>
                                        </Form>
                                    </Col>
                                </Row>
                                {adminError && <Alert variant="danger" className="mt-3">{adminError}</Alert>}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default ContestDetailPage;