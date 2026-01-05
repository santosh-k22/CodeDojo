import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Tabs, Tab, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../app/api';
import moment from 'moment';
import axios from 'axios';
import Countdown from 'react-countdown';
import { Trophy, Swords, CalendarCheck2, PlusCircle } from 'lucide-react';

const ContestCard = ({ contest }) => {
    const isDojoContest = !!contest.host;

    const getStatus = () => {
        const now = moment();
        const startTime = moment(contest.startTime);
        const endTime = moment(contest.endTime);
        if (now.isBefore(startTime)) return { text: 'Upcoming', variant: 'info', countdownTarget: contest.startTime };
        if (now.isAfter(endTime)) return { text: 'Finished', variant: 'secondary' };
        return { text: 'Live', variant: 'success', countdownTarget: contest.endTime };
    };

    const status = getStatus();
    const buttonLink = isDojoContest ? `/contests/${contest.slug}` : `https://codeforces.com/contest/${contest.id}`;

    const ButtonComponent = isDojoContest
        ? <Button as={Link} to={buttonLink} variant="primary" className="mt-auto w-100">View Details</Button>
        : <Button as="a" href={buttonLink} target="_blank" rel="noopener noreferrer" variant="outline-primary" className="mt-auto w-100">View on Codeforces</Button>;

    return (
        <Card className="mb-4 h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
                <Badge pill bg={isDojoContest ? 'dark' : 'secondary'} className="mb-2 align-self-start">
                    {isDojoContest ? <Trophy size={14} className="me-1" /> : <Swords size={14} className="me-1" />}
                    {contest.host || 'Codeforces'}
                </Badge>
                <Card.Title className="fw-bold h5">{contest.name}</Card.Title>
                <div className="text-muted small mb-2">
                    <CalendarCheck2 size={14} className="me-1" /> Starts: {moment(contest.startTime).format('MMM D, YYYY h:mm A')}
                </div>
                <div className={`mb-3 fw-bold text-${status.variant}`}>{status.text.toUpperCase()}</div>
                {status.countdownTarget && (
                    <div className="text-center my-2 p-2 bg-light rounded">
                        <Countdown date={status.countdownTarget} />
                    </div>
                )}
                {ButtonComponent}
            </Card.Body>
        </Card>
    );
};

const ContestsPage = () => {
    const [codeDojoContests, setCodeDojoContests] = useState([]);
    const [codeforcesContests, setCodeforcesContests] = useState([]);
    const [allContests, setAllContests] = useState([]);

    const [isLoadingDojo, setIsLoadingDojo] = useState(true);
    const [isLoadingCodeforces, setIsLoadingCodeforces] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isPaginating, setIsPaginating] = useState(false);

    const fetchDojoContests = async (pageNum = 1) => {
        if (pageNum === 1) setIsLoadingDojo(true);
        else setIsPaginating(true);

        try {
            const { data } = await api.get(`/contests?page=${pageNum}`);
            setCodeDojoContests(prev => pageNum === 1 ? data.contests : [...prev, ...data.contests]);
            setTotalPages(data.totalPages);
            setPage(pageNum);
        } catch (err) {
            console.error("Failed to fetch CodeDojo contests", err);
        } finally {
            setIsLoadingDojo(false);
            setIsPaginating(false);
        }
    };

    const fetchCodeforcesContests = async () => {
        setIsLoadingCodeforces(true);
        try {
            const { data } = await axios.get('https://codeforces.com/api/contest.list?gym=false');
            const upcoming = data.result
                .filter(c => c.phase === 'BEFORE')
                .map(c => ({
                    ...c,
                    startTime: new Date(c.startTimeSeconds * 1000),
                    endTime: new Date((c.startTimeSeconds + c.durationSeconds) * 1000),
                    slug: c.id,
                }));
            setCodeforcesContests(upcoming);
        } catch (err) {
            console.error("Failed to fetch Codeforces contests", err);
        } finally {
            setIsLoadingCodeforces(false);
        }
    };

    useEffect(() => {
        fetchDojoContests(1);
        fetchCodeforcesContests();
    }, []);

    useEffect(() => {
        const combined = [...codeDojoContests, ...codeforcesContests];
        combined.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        setAllContests(combined);
    }, [codeDojoContests, codeforcesContests]);

    const handleLoadMore = () => {
        fetchDojoContests(page + 1);
    };

    const renderContestList = (contests, isLoading, source) => {
        if (isLoading && contests.length === 0) {
            return <div className="text-center p-5"><Spinner animation="border" /></div>;
        }
        if (!isLoading && contests.length === 0) {
            return <Alert variant="info">No upcoming {source} contests found.</Alert>;
        }
        return (
            <Row>
                {contests.map((contest, index) => (
                    <Col md={6} lg={4} key={`${contest.id || contest._id}-${index}`}>
                        <ContestCard contest={contest} />
                    </Col>
                ))}
            </Row>
        );
    };

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Contests</h1>
                <Button as={Link} to="/contests/new"><PlusCircle size={18} className="me-1" /> Create Contest</Button>
            </div>

            <Tabs defaultActiveKey="all" id="contest-tabs" className="mb-4">
                <Tab eventKey="all" title="All Contests">
                    {renderContestList(allContests, isLoadingDojo || isLoadingCodeforces, 'All')}
                </Tab>
                <Tab eventKey="codedojo" title="CodeDojo Contests">
                    {renderContestList(codeDojoContests, isLoadingDojo, 'CodeDojo')}
                    <div className="text-center mt-4">
                        {!isLoadingDojo && page < totalPages && (
                            <Button onClick={handleLoadMore} disabled={isPaginating} variant="outline-secondary">
                                {isPaginating ? <><Spinner as="span" size="sm" /> Loading...</> : "Load More"}
                            </Button>
                        )}
                    </div>
                </Tab>
                <Tab eventKey="codeforces" title="Codeforces Contests">
                    {renderContestList(codeforcesContests, isLoadingCodeforces, 'Codeforces')}
                </Tab>
            </Tabs>
        </Container>
    );
};

export default ContestsPage;