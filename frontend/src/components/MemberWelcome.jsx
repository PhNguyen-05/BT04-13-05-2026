import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

const MemberWelcome = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    const profilePath = user.role === 'admin' ? '/admin/profile' : '/user/profile';

    return (
        <div className="aura-member-banner animate-fade-in-up">
            <div className="aura-member-banner-inner">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div className="aura-member-avatar">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-grow-1">
                        <p className="mb-0 small text-muted">Thành viên đang đăng nhập</p>
                        <h4 className="font-display mb-0">
                           Xin chào, 
                            <Link to={profilePath} className="text-aura text-decoration-none ms-1">
                                <span className="text-aura">{user.name}</span>
                            </Link>
                        </h4>
                        <small className="text-muted">{user.email}</small>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                        <Button as={Link} to="/shop" className="btn-aura btn-sm">
                            <i className="bi bi-bag-heart me-1" />
                            Mua sắm
                        </Button>
                        <Button className="btn-aura-outline btn-sm" onClick={logout}>
                            <i className="bi bi-box-arrow-right me-1" />
                            Đăng xuất
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberWelcome;
