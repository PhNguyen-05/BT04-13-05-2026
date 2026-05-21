import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import ProfileLayout from '../components/ProfileLayout';
import api from '../services/api.service';
import { useAuth } from '../hooks/useAuth';

const UserProfile = () => {
    const { user, updateUser, isLoggedIn } = useAuth();
    const fetchedRef = useRef(false);

    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ orderCount: 0 });
    const [form, setForm] = useState({ name: '', phone: '', address: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    useEffect(() => {
        if (!isLoggedIn || fetchedRef.current) return;

        const loadProfile = async () => {
            setLoading(true);
            setMessage('');
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
                setMessage(error.response?.data?.message || 'Không thể tải hồ sơ. Kiểm tra đăng nhập và backend.');
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

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
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
            setMessage(res.data.message || 'Cập nhật hồ sơ thành công');
        } catch (error) {
            setIsError(true);
            setMessage(error.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordMessage('');
        setPasswordError(false);

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError(true);
            setPasswordMessage('Mật khẩu xác nhận không khớp');
            return;
        }

        setChangingPassword(true);
        try {
            const res = await api.patch('/auth/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            setPasswordMessage(res.data.message || 'Đổi mật khẩu thành công');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setPasswordError(true);
            setPasswordMessage(error.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setChangingPassword(false);
        }
    };

    const displayUser = profile || user;

    if (loading) {
        return (
            <div className="aura-profile-page">
                <div className="text-center py-5">
                    <Spinner animation="border" style={{ color: 'var(--rose-deep)' }} />
                    <p className="mt-3 text-muted">Đang tải hồ sơ...</p>
                </div>
            </div>
        );
    }

    return (
        <ProfileLayout
            title="Hồ sơ thành viên"
            subtitle="Cập nhật thông tin cá nhân để thanh toán và giao hàng nhanh hơn"
            user={displayUser}
            stats={stats}
            isAdmin={false}
        >
            <Card className="aura-profile-card border-0 mb-4">
                <Card.Body className="p-4 p-md-5">
                    <h3 className="font-display h5 mb-4">
                        <i className="bi bi-pencil-square me-2 text-aura" />
                        Thông tin cá nhân
                    </h3>

                    {message && (
                        <Alert variant={isError ? 'danger' : 'success'} className="rounded-4 border-0">
                            {message}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="aura-form-label">Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        className="aura-form-control"
                                        value={displayUser?.email || ''}
                                        disabled
                                        readOnly
                                    />
                                    <Form.Text className="text-muted">Email không thể thay đổi</Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="aura-form-label">Họ và tên</Form.Label>
                                    <Form.Control
                                        name="name"
                                        className="aura-form-control"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="aura-form-label">Số điện thoại</Form.Label>
                                    <Form.Control
                                        name="phone"
                                        className="aura-form-control"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="0901234567"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="aura-form-label">Địa chỉ giao hàng</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="address"
                                        className="aura-form-control"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Số nhà, đường, quận, thành phố"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button type="submit" className="btn-aura px-4" disabled={saving}>
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="aura-profile-card border-0">
                <Card.Body className="p-4 p-md-5">
                    <h3 className="font-display h5 mb-4">
                        <i className="bi bi-shield-lock me-2 text-aura" />
                        Đổi mật khẩu
                    </h3>

                    {passwordMessage && (
                        <Alert variant={passwordError ? 'danger' : 'success'} className="rounded-4 border-0">
                            {passwordMessage}
                        </Alert>
                    )}

                    <Form onSubmit={handlePasswordSubmit}>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="aura-form-label">Mật khẩu hiện tại</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="currentPassword"
                                        className="aura-form-control"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="aura-form-label">Mật khẩu mới</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="newPassword"
                                        className="aura-form-control"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        minLength={6}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="aura-form-label">Xác nhận mật khẩu mới</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        className="aura-form-control"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        minLength={6}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button type="submit" variant="outline-dark" className="rounded-pill px-4" disabled={changingPassword}>
                            {changingPassword ? 'Đang đổi...' : 'Cập nhật mật khẩu'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </ProfileLayout>
    );
};

export default UserProfile;
