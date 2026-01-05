import { useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert, Card } from 'react-bootstrap';
import api from '../app/api';
import VerdictChart from '../features/components/VerdictChart';
import DifficultyChart from '../features/components/DifficultyChart';
import TagsChart from '../features/components/TagsChart';
import UserStatCard from '../features/components/UserStatCard';
import SubmissionHeatmap from '../features/components/SubmissionHeatmap';
import { Award, Star, BarChart3, TrendingUp } from 'lucide-react';

const ComparisonPage = () => {
    const [handle1, setHandle1] = useState('');
    const [handle2, setHandle2] = useState('');
    const [data1, setData1] = useState(null);
    const [data2, setData2] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCompare = async (e) => {
        e.preventDefault();
        if (!handle1 || !handle2) {
            setError('Please provide two handles to compare.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setData1(null);
        setData2(null);

        try {
            const [stats1, info1] = await Promise.all([
                api.get(`/profile/stats/${handle1}`),
                api.get(`/profile/info/${handle1}`)
            ]);

            const [stats2, info2] = await Promise.all([
                api.get(`/profile/stats/${handle2}`),
                api.get(`/profile/info/${handle2}`)
            ]);

            setData1({ stats: stats1.data, info: info1.data });
            setData2({ stats: stats2.data, info: info2.data });

        } catch (err) {
            setError('Failed to fetch data. Check handles and try again.');
        } finally {
            setIsLoading(false);
        }
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
            <h2 className="mb-4 text-center">Compare Codeforces Users</h2>
            <Form onSubmit={handleCompare}>
                <Row className="align-items-center justify-content-center mb-4">
                    <Col md={4}>
                        <Form.Control
                            type="text"
                            placeholder="Enter handle 1 (e.g., tourist)"
                            value={handle1}
                            onChange={(e) => setHandle1(e.target.value)}
                            required
                        />
                    </Col>
                    <Col md={4}>
                        <Form.Control
                            type="text"
                            placeholder="Enter handle 2 (e.g., Petr)"
                            value={handle2}
                            onChange={(e) => setHandle2(e.target.value)}
                            required
                        />
                    </Col>
                    <Col md={2}>
                        <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                            {isLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Compare'}
                        </Button>
                    </Col>
                </Row>
            </Form>

            {error && <Alert variant="danger">{error}</Alert>}

            {!isLoading && !data1 && !data2 && (
                <Alert variant="info" className="text-center">Enter two handles to see a side-by-side comparison.</Alert>
            )}

            {data1 && data2 && (
                <Row>
                    <Col lg={6}>
                        <h3 className="text-center mb-3">{data1.info.handle}</h3>
                        {renderUserStats(data1)}
                    </Col>
                    <Col lg={6}>
                        <h3 className="text-center mb-3">{data2.info.handle}</h3>
                        {renderUserStats(data2)}
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default ComparisonPage;