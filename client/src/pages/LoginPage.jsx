import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../app/AuthContext';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import api from '../app/api';

const LoginPage = () => {
    const [handle, setHandle] = useState('');
    const [challenge, setChallenge] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { loginWithChallenge } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleCreateChallenge = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setChallenge(null);

        try {
            const response = await api.post('/auth/challenge', { handle });
            setChallenge(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to start challenge. Please check the handle and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyChallenge = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await loginWithChallenge(handle);
            navigate('/dashboard'); // Redirect to dashboard on successful login
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed. Please ensure you have submitted the solution correctly.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="text-center mb-4">Login with Codeforces</Card.Title>

                            {!challenge ? (
                                <Form onSubmit={handleCreateChallenge}>
                                    <Form.Group className="mb-3" controlId="formBasicHandle">
                                        <Form.Label>Codeforces Handle</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter your handle (e.g., tourist)"
                                            value={handle}
                                            onChange={(e) => setHandle(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                                        {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Login'}
                                    </Button>
                                </Form>
                            ) : (
                                <div>
                                    <h5>Challenge Details</h5>
                                    <p>
                                        <strong>Problem:</strong> <a href={challenge.problemUrl} target="_blank" rel="noopener noreferrer">{challenge.problemName}</a>
                                    </p>
                                    <p>
                                        <strong>Instructions:</strong> Submit a solution for this problem that results in a "Compilation error". You can do this by simply submitting code that doesn't compile (e.g., `int main() {'{'} syntax error; {'}'}`). Make sure it is your most recent submission.
                                    </p>
                                    <Alert variant="info">
                                        You have 10 minutes to complete this challenge before it expires.
                                    </Alert>
                                    <Button variant="success" className="w-100" onClick={handleVerifyChallenge} disabled={isLoading}>
                                        {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Verify Submission'}
                                    </Button>
                                </div>
                            )}
                            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;