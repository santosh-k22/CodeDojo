import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import api from '../app/api';
import { AuthContext } from '../app/AuthContext';

const ContestCreationForm = () => {
    const [name, setName] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!user) {
            setError('You must be logged in to create a contest.');
            setIsLoading(false);
            return;
        }

        try {
            const newContest = {
                name,
                startTime,
                endTime,
                host: user.handle,
            };

            await api.post('/contests/create', newContest);
            navigate('/contests'); // Redirect after successful creation

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create contest.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="mt-4">
            <Row className="justify-content-md-center">
                <Col md={8}>
                    <Card>
                        <Card.Header as="h4">Create a New Contest</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Contest Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter contest name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Start Time</Form.Label>
                                            <Form.Control
                                                type="datetime-local"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>End Time</Form.Label>
                                            <Form.Control
                                                type="datetime-local"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button variant="primary" type="submit" disabled={isLoading}>
                                    {isLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Create Contest'}
                                </Button>
                                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ContestCreationForm;