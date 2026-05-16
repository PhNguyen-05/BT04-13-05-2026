import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <BootstrapNavbar bg="light" expand="lg" sticky="top">
            <Container>
                <BootstrapNavbar.Brand as={Link} to="/">🌸 Aura Lips</BootstrapNavbar.Brand>
                <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
                <BootstrapNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
                        <Nav.Link as={Link} to="/shop">Cửa hàng</Nav.Link>
                    </Nav>

                    <Nav className="ms-auto align-items-center">
                        {user ? (
                            <>
                                <span className="me-3">
                                    Xin chào, <strong>{user.name}</strong>
                                    {user.role && (
                                        <small className="text-muted ms-1">({user.role})</small>
                                    )}
                                </span>
                                <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                                    Đăng xuất
                                </Button>
                            </>
                        ) : (
                            <Button variant="primary" as={Link} to="/login">Đăng nhập</Button>
                        )}
                    </Nav>
                </BootstrapNavbar.Collapse>
            </Container>
        </BootstrapNavbar>
    );
};

export default Navbar;