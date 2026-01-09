import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Table, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import api from '../app/api';
import moment from 'moment';
import { AuthContext } from '../app/AuthContext';
import UserStatCard from '../features/components/UserStatCard';
import VerdictChart from '../features/components/VerdictChart';
import TagsChart from '../features/components/TagsChart';
import DifficultyChart from '../features/components/DifficultyChart';
import ProblemRecommendations from '../features/components/ProblemRecommendations';
import SubmissionHeatmap from '../features/components/SubmissionHeatmap';
import UpcomingContestsWidget from '../features/components/UpcomingContestsWidget';
import { getHandleColor, getRankTitle } from '../utils/codeforcesColors';
import { Award, Star, BarChart3, TrendingUp, UserPlus, UserCheck } from 'lucide-react';
import useUserProfile from '../hooks/useUserProfile';

const Dashboard = () => {
    const { handle: routeHandle } = useParams();
    const { user } = useContext(AuthContext);

    const targetHandle = routeHandle || user?.handle;
    const isOwner = !routeHandle || (user && user.handle === routeHandle);

    const { data: hookData, loading: hookLoading, error: hookError } = useUserProfile(targetHandle);

    const [isFollowing, setIsFollowing] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [friendsLoading, setFriendsLoading] = useState(false);

    useEffect(() => {
        const checkFollowStatus = async () => {
            if (user && !isOwner && targetHandle) {
                setFriendsLoading(true);
                try {
                    const { data: friendsData } = await api.get('/users/friends');
                    const isFriend = friendsData.friends.some(f => f.handle === targetHandle);
                    setIsFollowing(isFriend);
                } catch (e) {
                    console.error("Failed to check friends", e);
                } finally {
                    setFriendsLoading(false);
                }
            }
        };
        checkFollowStatus();
    }, [user, isOwner, targetHandle]);

    const isLoading = hookLoading || friendsLoading;
    const error = hookError ? 'Failed to fetch user data.' : null;

    const handleToggleFollow = async () => {
        if (!user) return;
        setIsToggling(true);
        try {
            const { data: internalUser } = await api.get(`/users/find/${targetHandle}`);
            await api.post(`/users/follow/${internalUser._id}`);
            setIsFollowing(!isFollowing);
        } catch {
            alert('Could not follow user. They might not be registered on CodeDojo.');
        } finally {
            setIsToggling(false);
        }
    };

    if (isLoading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    if (!targetHandle) return <Container className="mt-5"><Alert variant="info">Please log in.</Alert></Container>;

    if (!hookData) return null;

    const { info, stats: statsData, submissions = [] } = hookData;

    return (
        <Container fluid className="p-4" style={{ maxWidth: '1600px' }}>
            <Row className="mb-4">
                <Col className="d-flex align-items-center justify-content-between">
                    <div>
                        <h2 className="mb-3 d-flex align-items-center gap-3">
                            <span>Welcome back, <span style={{ color: getHandleColor(info.rating) }}>{info.handle}</span>!</span>
                            {!isOwner && user && (
                                <Button
                                    variant={isFollowing ? "outline-secondary" : "outline-primary"}
                                    onClick={handleToggleFollow}
                                    disabled={isToggling}
                                    size="sm"
                                    className="d-flex align-items-center gap-2"
                                >
                                    {isToggling ? <Spinner size="sm" /> : (
                                        isFollowing ? <><UserCheck size={18} /> Following</> : <><UserPlus size={18} /> Follow</>
                                    )}
                                </Button>
                            )}
                        </h2>
                        <div className="text-muted d-flex align-items-center gap-2">
                            <span className="badge bg-light text-dark border">{getRankTitle(info.rating)}</span>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col sm={6} xl={3} className="mb-3 mb-xl-0"><UserStatCard title="Rank" value={info.rank || 'N/A'} icon={Award} /></Col>
                <Col sm={6} xl={3} className="mb-3 mb-xl-0"><UserStatCard title="Rating" value={info.rating || 'N/A'} icon={Star} /></Col>
                <Col sm={6} xl={3} className="mb-3 mb-xl-0"><UserStatCard title="Max Rating" value={info.maxRating || 'N/A'} icon={BarChart3} /></Col>
                <Col sm={6} xl={3}><UserStatCard title="Contribution" value={info.contribution || 0} icon={TrendingUp} /></Col>
            </Row>

            <Row className="mb-4">
                <Col lg={isOwner ? 8 : 12} className="mb-4 mb-lg-0">
                    <Card className="h-100">
                        <Card.Header>Activity Year</Card.Header>
                        <Card.Body>
                            <SubmissionHeatmap userId={targetHandle} />
                        </Card.Body>
                    </Card>
                </Col>
                {isOwner && (
                    <Col lg={4}>
                        <UpcomingContestsWidget />
                    </Col>
                )}
            </Row>

            <Row>
                <Col lg={7}>
                    {isOwner && (
                        <div className="mb-4">
                            <ProblemRecommendations />
                        </div>
                    )}

                    <Card className="mb-4">
                        <Card.Header>Recent Submissions</Card.Header>
                        <Table responsive hover className="mb-0">
                            <thead>
                                <tr>
                                    <th>Problem</th>
                                    <th>Verdict</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.slice(0, 10).map(sub => (
                                    <tr key={sub.id}>
                                        <td>
                                            <a href={`https://codeforces.com/contest/${sub.contestId}/problem/${sub.problem.index}`} target="_blank" rel="noopener noreferrer">
                                                {sub.problem.name}
                                            </a>
                                        </td>
                                        <td className={sub.verdict === 'OK' ? 'text-success' : 'text-danger'}>{sub.verdict.replace(/_/g, ' ')}</td>
                                        <td>{moment(sub.creationTimeSeconds * 1000).fromNow()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                </Col>

                <Col lg={5}>
                    <Card className="mb-4">
                        <Card.Header>Solved Difficulty</Card.Header>
                        <Card.Body>
                            <DifficultyChart data={statsData.difficulty || {}} />
                        </Card.Body>
                    </Card>
                    <Card className="mb-4">
                        <Card.Header>Verdict Distribution</Card.Header>
                        <Card.Body>
                            <VerdictChart data={statsData.verdicts} />
                        </Card.Body>
                    </Card>
                    <Card className="mb-4">
                        <Card.Header>Top Solved Tags</Card.Header>
                        <Card.Body>
                            <TagsChart data={statsData.tags} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;