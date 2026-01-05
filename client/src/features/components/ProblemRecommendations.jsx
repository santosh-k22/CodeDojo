import { useState, useEffect } from 'react';
import { Card, Table, Spinner, Alert, Badge } from 'react-bootstrap';
import api from '../../app/api';

const ProblemRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const { data } = await api.get('/profile/recommendations');
                setRecommendations(data);
            } catch (err) {
                setError('Could not load problem recommendations.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecommendations();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-3"><Spinner animation="border" size="sm" /></div>;
        }
        if (error) {
            return <Alert variant="warning" className="m-3">{error}</Alert>;
        }
        if (recommendations.length === 0) {
            return <Alert variant="info" className="m-3">No recommendations available at the moment.</Alert>;
        }
        return (
            <Table responsive hover className="mb-0">
                <thead>
                    <tr>
                        <th>Problem</th>
                        <th>Rating</th>
                        <th>Tags</th>
                    </tr>
                </thead>
                <tbody>
                    {recommendations.map((prob) => (
                        <tr key={`${prob.contestId}-${prob.index}`}>
                            <td>
                                <a href={`https://codeforces.com/problemset/problem/${prob.contestId}/${prob.index}`} target="_blank" rel="noopener noreferrer">
                                    {prob.name}
                                </a>
                            </td>
                            <td>{prob.rating}</td>
                            <td>
                                {prob.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} className="me-1" bg="info" style={{ fontWeight: '500' }}>
                                        {tag}
                                    </Badge>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        );
    };

    return (
        <Card>
            <Card.Header>Personalized Problem Recommendations</Card.Header>
            {renderContent()}
        </Card>
    );
};

export default ProblemRecommendations;