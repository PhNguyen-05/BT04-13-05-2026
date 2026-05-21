import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const ProfileSidebar = ({ user, stats = {}, isAdmin = false }) => {
    const orderCount = stats.orderCount ?? 0;

    return (
        <Card className="aura-profile-card border-0 h-100">
            <Card.Body className="p-4 text-center">
                <div className="aura-profile-avatar mx-auto mb-3">
                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <h2 className="font-display h4 mb-1">{user?.name || 'Thành viên'}</h2>
                <p className="text-muted small mb-3">{user?.email}</p>

                <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                    <Badge bg="light" text="dark" className="rounded-pill px-3 py-2">
                        {isAdmin ? 'Quản trị viên' : 'Khách hàng'}
                    </Badge>
                    {user?.isVerified !== false && (
                        <Badge className="rounded-pill px-3 py-2" style={{ background: 'var(--gradient-btn)' }}>
                            <i className="bi bi-patch-check me-1" />
                            Đã kích hoạt
                        </Badge>
                    )}
                </div>

                <div className="aura-profile-stat-grid mb-4">
                    <div className="aura-profile-stat">
                        <span className="aura-profile-stat-value">{orderCount}</span>
                        <span className="aura-profile-stat-label">Đơn hàng</span>
                    </div>
                    <div className="aura-profile-stat">
                        <span className="aura-profile-stat-value">{formatDate(user?.createdAt)}</span>
                        <span className="aura-profile-stat-label">Tham gia</span>
                    </div>
                </div>

                <div className="d-grid gap-2">
                    <Link to="/orders" className="btn btn-aura-outline btn-sm rounded-pill">
                        <i className="bi bi-receipt-cutoff me-1" />
                        Lịch sử mua hàng
                    </Link>
                    <Link to="/shop" className="btn btn-aura btn-sm rounded-pill">
                        <i className="bi bi-bag-heart me-1" />
                        Tiếp tục mua sắm
                    </Link>
                    {isAdmin && (
                        <Link to="/admin/orders" className="btn btn-dark btn-sm rounded-pill">
                            <i className="bi bi-gear me-1" />
                            Quản lý đơn hàng
                        </Link>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

const ProfileLayout = ({ title, subtitle, user, stats, isAdmin, children }) => (
    <div className="aura-profile-page">
        <Container className="py-4 py-lg-5">
            <div className="aura-profile-hero animate-fade-in-up mb-4">
                <div>
                    <p className="aura-profile-eyebrow mb-2">
                        <i className="bi bi-person-heart me-2" />
                        {isAdmin ? 'Khu vực quản trị' : 'Tài khoản của bạn'}
                    </p>
                    <h1 className="font-display mb-2">{title}</h1>
                    {subtitle && <p className="mb-0 text-muted">{subtitle}</p>}
                </div>
            </div>

            <Row className="g-4">
                <Col lg={4}>
                    <ProfileSidebar user={user} stats={stats} isAdmin={isAdmin} />
                </Col>
                <Col lg={8}>{children}</Col>
            </Row>
        </Container>
    </div>
);

export default ProfileLayout;
