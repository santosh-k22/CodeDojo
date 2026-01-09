import { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Calendar, ExternalLink } from 'lucide-react';
import api from '../../app/api';
import useCodeforcesContests from '../../hooks/useCodeforcesContests';

const UpcomingContestsWidget = () => {
    const [contests, setContests] = useState([]);
    const [isLoadingDojo, setIsLoadingDojo] = useState(true);

    const { contests: cfContests, loading: isLoadingCF } = useCodeforcesContests();

    useEffect(() => {
        const fetchDojoContests = async () => {
            try {
                const { data } = await api.get('/contests?limit=3');
                const dojoContests = data.contests.map(c => ({
                    ...c,
                    type: 'CodeDojo',
                    link: `/contests/${c.slug}`
                }));

                return dojoContests;
            } catch {
                console.error('Failed to fetch upcoming contests');
                return []; // Ensure an empty array is returned on error
            } finally {
                setIsLoadingDojo(false);
            }
        };

        fetchDojoContests().then(dojo => {
            setDojoContests(dojo);
        });
    }, []);

    const [dojoContests, setDojoContests] = useState([]);

    useEffect(() => {
        if (isLoadingDojo || isLoadingCF) return;

        const relevantCF = cfContests.slice(0, 3).map(c => ({
            ...c,
            type: 'Codeforces'
        }));

        const relevantContests = [...dojoContests, ...relevantCF]
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
            .slice(0, 5);

        setContests(relevantContests);
    }, [dojoContests, cfContests, isLoadingDojo, isLoadingCF]);

    if (isLoadingDojo || isLoadingCF) return <div className="text-center p-3"><Spinner size="sm" /></div>;

    return (
        <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <span>Upcoming Contests</span>
                <Link to="/contests" className="text-decoration-none small">View All</Link>
            </Card.Header>
            <ListGroup variant="flush">
                {contests.length > 0 ? contests.map((contest, idx) => (
                    <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                        <div className="text-truncate me-2">
                            <div className="fw-medium text-truncate" title={contest.name}>{contest.name}</div>
                            <small className="text-muted">
                                <Calendar size={12} className="me-1" />
                                {moment(contest.startTime).format('MMM D, HH:mm')}
                            </small>
                        </div>
                        <div className="d-flex align-items-center">
                            <Badge bg={contest.type === 'CodeDojo' ? 'primary' : 'secondary'} className="me-2" style={{ fontSize: '0.65rem' }}>
                                {contest.type}
                            </Badge>
                            {contest.type === 'CodeDojo' ? (
                                <Link to={contest.link}><Button size="sm" variant="outline-primary" style={{ padding: '0.1rem 0.4rem' }}>Join</Button></Link>
                            ) : (
                                <a href={contest.link} target="_blank" rel="noopener noreferrer" className="text-muted"><ExternalLink size={14} /></a>
                            )}
                        </div>
                    </ListGroup.Item>
                )) : (
                    <div className="p-3 text-center small text-muted">No upcoming contests found.</div>
                )}
            </ListGroup>
        </Card>
    );
};

export default UpcomingContestsWidget;
