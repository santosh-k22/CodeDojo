import { useContext } from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../app/AuthContext';
import { CircleUserRound, LogOut } from 'lucide-react';
import UserLink from '../features/components/UserLink';

const NavigationBar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <Navbar expand="lg" className="mb-4 bg-white sticky-top">
            <Container>
                <Navbar.Brand as={Link} to="/">CodeDojo</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={NavLink} to="/dashboard">Dashboard</Nav.Link>
                        <Nav.Link as={NavLink} to="/contests">Contests</Nav.Link>
                        <Nav.Link as={NavLink} to="/community">Community</Nav.Link>
                        <Nav.Link as={NavLink} to="/friends">Friends</Nav.Link>
                        <Nav.Link as={NavLink} to="/compare">Compare</Nav.Link>
                    </Nav>

                    <Nav>
                        {user ? (
                            <NavDropdown
                                title={<CircleUserRound size={24} />}
                                id="user-profile-dropdown"
                                align="end"
                            >
                                <NavDropdown.ItemText className="text-muted">
                                    Signed in as <UserLink handle={user.handle} rating={user.rating} />
                                </NavDropdown.ItemText>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={logout}>
                                    <LogOut size={16} className="me-2" /> Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Nav.Link as={Link} to="/login">Login</Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar >
    );
};

export default NavigationBar;