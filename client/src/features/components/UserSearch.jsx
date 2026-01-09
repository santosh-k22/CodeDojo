import { useState } from 'react';
import { Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../app/api';
import { Search } from 'lucide-react';

const UserSearch = ({ onSearchStart, onSearchEnd, className, onUserFound, disableRedirect, placeholder, checkGlobal }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        const handle = searchQuery.trim();
        if (!handle) return;

        setIsSearching(true);
        setError(null);
        if (onSearchStart) onSearchStart();

        try {
            if (checkGlobal) {
                await api.get(`/profile/info/${handle}`);
            } else {
                await api.get(`/users/find/${handle}`);
            }

            if (disableRedirect && onUserFound) {
                onUserFound(handle);
                setSearchQuery('');
            } else {
                navigate(`/profile/${handle}`);
            }
        } catch {
            setError('User not found');
        } finally {
            setIsSearching(false);
            if (onSearchEnd) onSearchEnd();
        }
    };

    return (
        <div className={className}>
            <Form onSubmit={handleSearch}>
                <InputGroup>
                    <Form.Control
                        type="text"
                        placeholder={placeholder || "Enter Codeforces handle..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        isInvalid={!!error}
                    />
                    <Button type="submit" variant="primary" disabled={isSearching}>
                        {isSearching ? <Spinner size="sm" animation="border" /> : <Search size={18} />}
                    </Button>
                    <Form.Control.Feedback type="invalid">
                        {error}
                    </Form.Control.Feedback>
                </InputGroup>
            </Form>
        </div>
    );
};

export default UserSearch;
