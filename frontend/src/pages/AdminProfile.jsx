import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProfileLayout from '../components/ProfileLayout';
import api from '../services/api.service';
import { useAuth } from '../hooks/useAuth';

const AdminProfile = () => {
    const { user, updateUser, isLoggedIn } = useAuth();
    const fetchedRef = useRef(false);

    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ orderCount: 0 });
    const [form, setForm] = useState({ name: '', phone: '', address: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (!isLoggedIn || fetchedRef.current) return;

        const loadProfile = async () => {
            setLoading(true);
            try {
                const res = await api.get('/auth/profile');
                const profileUser = res.data.user;
                setProfile(profileUser);
                setStats(res.data.stats || { orderCount: 0 });
                setForm({
                    name: profileUser.name || '',
                    phone: profileUser.phone || '',
                    address: profileUser.address || '',
                });
                updateUser(profileUser);
            } catch (error) {
                setIsError(true);
                setMessage(error.response?.data?.message || 'Không thể tải hồ sơ admin');
                setProfile(user);
                setForm({
                    name: user?.name || '',
                    phone: user?.phone || '',
                    address: user?.address || '',
                });
            } finally {
                fetchedRef.current = true;
                setLoading(false);
            }
        };

        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setIsError(false);
        try {
            const res = await api.put('/auth/profile', form);
            setProfile(res.data.user);
            updateUser(res.data.user);
            setMessage(res.data.message || 'Cập nhật thành công');
        } catch (error) {
            setIsError(true);
            setMessage(error.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };

    const displayUser = profile || user;

    if (loading) {
        return (
            <div className="aura-profile-page">
                <div className="text-center py-5">
                    <Spinner animation="border" style={{ color: 'var(--rose-deep)' }} />
                    <p className="mt-3 text-muted">Đang tải bảng quản trị...</p>
                </div>
            </div>
        );
    }

    return (
        <ProfileLayout
            title="Bảng quản trị Aura Lips"
            subtitle="Quản lý đơn hàng và thông tin tài khoản admin"
            user={displayUser}
            stats={stats}
            isAdmin
        >
            <Row className="g-4 mb-4">
                <Col md={6}>
                    <Card className="aura-profile-card border-0 h-100 aura-profile-action-card">
                        <Card.Body className="p-4">
                            <i className="bi bi-receipt-cutoff fs-2 text-aura mb-3 d-block" />
                            <h4 className="font-display h5">Quản lý đơn hàng</h4>
                            <p className="text-muted small">Xem, lọc và cập nhật trạng thái đơn của khách</p>
                            <Button as={Link} to="/admin/orders" className="btn-aura btn-sm rounded-pill">
                                Mở trang quản lý
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="aura-profile-card border-0 h-100 aura-profile-action-card">
                        <Card.Body className="p-4">
                            <i className="bi bi-bag-heart fs-2 text-aura mb-3 d-block" />
                            <h4 className="font-display h5">Cửa hàng</h4>
                            <p className="text-muted small">Xem sản phẩm như khách hàng trên website</p>
                            <Button as={Link} to="/shop" variant="outline-dark" className="btn-sm rounded-pill">
                                Xem cửa hàng
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="aura-profile-card border-0">
                <Card.Body className="p-4 p-md-5">
                    <h3 className="font-display h5 mb-4">Thông tin admin</h3>

                    {message && (
                        <Alert variant={isError ? 'danger' : 'success'} className="rounded-4 border-0">
                            {message}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="aura-form-label">Email</Form.Label>
                            <Form.Control type="email" className="aura-form-control" value={displayUser?.email || ''} disabled readOnly />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="aura-form-label">Họ và tên</Form.Label>
                                    <Form.Control name="name" className="aura-form-control" value={form.name} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="aura-form-label">Số điện thoại</Form.Label>
                                    <Form.Control name="phone" className="aura-form-control" value={form.phone} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="aura-form-label">Địa chỉ</Form.Label>
                                    <Form.Control as="textarea" rows={2} name="address" className="aura-form-control" value={form.address} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button type="submit" className="btn-aura px-4" disabled={saving}>
                            {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </ProfileLayout>
    );
};

export default AdminProfile;
