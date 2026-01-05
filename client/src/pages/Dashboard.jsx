import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Table } from 'react-bootstrap';
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
import { Award, Star, BarChart3, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    const { handle: routeHandle } = useParams(); // Get handle from URL if present
    const { user } = useContext(AuthContext);

    // Determine the target handle
    const targetHandle = routeHandle || user?.handle;
    const isOwner = !routeHandle || (user && user.handle === routeHandle);

    const [profileData, setProfileData] = useState(null);
    const [statsData, setStatsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!targetHandle) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const infoPromise = api.get(`/profile/info/${targetHandle}`);
                const statsPromise = api.get(`/profile/stats/${targetHandle}?t=${Date.now()}`);

                const [infoRes, statsRes] = await Promise.all([infoPromise, statsPromise]);

                if (isOwner) {
                    const { data } = await api.get('/profile/data');
                    setProfileData(data);
                } else {
                    setProfileData({ info: infoRes.data, submissions: [] });
                }

                setStatsData(statsRes.data);
            } catch (err) {
                setError('Failed to fetch data.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [targetHandle, isOwner]);

    if (isLoading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    // Fallback if no user
    if (!targetHandle) return <Container className="mt-5"><Alert variant="info">Please log in.</Alert></Container>;
    if (!profileData || !statsData) return null;

    const { info, submissions } = profileData;

    return (
        <Container fluid className="p-4" style={{ maxWidth: '1600px' }}> {/* Wider container for dashboard feel */}
            {/* 1. Header & Quick Stats Row */}
            <Row className="mb-4">
                <Col>
                    <h2 className="mb-3">
                        Welcome back, <span style={{ color: getHandleColor(info.rating) }}>{info.handle}</span>!
                    </h2>
                    <div className="text-muted d-flex align-items-center gap-2">
                        <span className="badge bg-light text-dark border">{getRankTitle(info.rating)}</span>
                    </div>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col sm={6} xl={3} className="mb-3 mb-xl-0"><UserStatCard title="Rank" value={info.rank || 'N/A'} icon={Award} /></Col>
                <Col sm={6} xl={3} className="mb-3 mb-xl-0"><UserStatCard title="Rating" value={info.rating || 'N/A'} icon={Star} /></Col>
                <Col sm={6} xl={3} className="mb-3 mb-xl-0"><UserStatCard title="Max Rating" value={info.maxRating || 'N/A'} icon={BarChart3} /></Col>
                <Col sm={6} xl={3}><UserStatCard title="Contribution" value={info.contribution || 0} icon={TrendingUp} /></Col>
            </Row>

            {/* 2. Activity & Engagement Row (Heatmap + Contests) */}
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

            {/* 3. Main Content: Recommendations vs Analytics vs Submissions */}
            <Row>
                {/* Left Column: Recommendations & Submissions */}
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
                                {submissions.slice(0, 10).map(sub => ( // Limit to 10
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

                {/* Right Column: Analytical Charts */}
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