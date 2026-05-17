import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Navbar as BootstrapNavbar, Nav, Container, Button, Badge } from 'react-bootstrap';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { getTotalItems } = useContext(CartContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;
    const cartCount = getTotalItems();

    return (
        <BootstrapNavbar
            expand="lg"
            sticky="top"
            className={`aura-navbar ${scrolled ? 'scrolled' : ''}`}
        >
            <Container>
                <BootstrapNavbar.Brand as={Link} to="/" className="aura-brand">
                    <span className="aura-brand-icon">
                        <i className="bi bi-heart-fill" />
                    </span>
                    Aura Lips
                </BootstrapNavbar.Brand>

                <BootstrapNavbar.Toggle aria-controls="aura-nav" />
                <BootstrapNavbar.Collapse id="aura-nav">
                    <Nav className="me-auto ms-lg-3">
                        <Nav.Link as={Link} to="/" className={`aura-nav-link ${isActive('/') ? 'active' : ''}`}>
                            <i className="bi bi-house-heart me-1" />
                            Trang chủ
                        </Nav.Link>
                        <Nav.Link as={Link} to="/shop" className={`aura-nav-link ${isActive('/shop') ? 'active' : ''}`}>
                            <i className="bi bi-bag-heart me-1" />
                            Cửa hàng
                        </Nav.Link>
                        <Nav.Link as={Link} to="/news" className={`aura-nav-link ${isActive('/news') ? 'active' : ''}`}>
                            <i className="bi bi-newspaper me-1" />
                            Tin & bài viết
                        </Nav.Link>
                    </Nav>

                    <Nav className="ms-auto align-items-center gap-2">
                        {user ? (
                            <>
                                <span className="aura-user-pill d-none d-lg-inline" title={user.email}>
                                    <i className="bi bi-person-heart me-1 text-aura" />
                                    Xin chào, <strong>{user.name}</strong>
                                </span>
                                {cartCount > 0 && (
                                    <Badge
                                        pill
                                        className="align-self-center"
                                        style={{ background: 'var(--gradient-btn)' }}
                                    >
                                        <i className="bi bi-cart3 me-1" />
                                        {cartCount}
                                    </Badge>
                                )}
                                <Button className="btn-aura-outline btn-sm" onClick={handleLogout}>
                                    <i className="bi bi-box-arrow-right me-1" />
                                    Đăng xuất
                                </Button>
                            </>
                        ) : (
                            <Button as={Link} to="/login" className="btn-aura">
                                <i className="bi bi-person-heart me-2" />
                                Đăng nhập
                            </Button>
                        )}
                    </Nav>
                </BootstrapNavbar.Collapse>
            </Container>
        </BootstrapNavbar>
    );
};

export default Navbar;
