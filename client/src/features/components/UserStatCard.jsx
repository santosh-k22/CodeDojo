import { Card } from 'react-bootstrap';

const UserStatCard = ({ title, value, icon: Icon }) => {
    return (
        <Card>
            <Card.Body>
                <div className="d-flex align-items-center">
                    {Icon && <Icon size={24} className="me-3" style={{ color: 'var(--primary)' }} />}
                    <div>
                        <Card.Subtitle
                            className="mb-1"
                            style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem' }}
                        >
                            {title}
                        </Card.Subtitle>
                        <Card.Title as="h4" className="m-0" style={{ color: 'var(--text-primary)' }}>
                            {value}
                        </Card.Title>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default UserStatCard;