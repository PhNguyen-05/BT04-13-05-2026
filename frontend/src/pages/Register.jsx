import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Row, Col, Form, Button } from 'react-bootstrap';
import api from '../services/api.service';

const AUTH_IMAGE = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });
            if (res.data.requiresVerification) {
                alert(res.data.message || 'Vui lòng kiểm tra email để nhập mã OTP.');
                navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
            } else {
                alert(res.data.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
                navigate('/login');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="aura-auth-page">
            <Row className="g-0 min-vh-100">
                <Col lg={7} className="d-none d-lg-block p-0 order-lg-1">
                    <div className="aura-auth-visual">
                        <img src={AUTH_IMAGE} alt="Trang điểm Aura Lips" />
                        <div className="aura-auth-visual-overlay" />
                        <div className="aura-auth-visual-content animate-fade-in-up delay-2">
                            <span className="aura-hero-badge">🎁 Ưu đãi thành viên</span>
                            <h2 className="font-display">Gia nhập gia đình Aura</h2>
                            <p className="lead mb-0" style={{ color: 'var(--text-soft)' }}>
                                Đăng ký ngay để nhận voucher giảm 15% cho đơn son đầu tiên.
                            </p>
                        </div>
                        <span className="aura-deco-heart" style={{ bottom: '25%', right: '10%' }}>💕</span>
                    </div>
                </Col>

                <Col lg={5} className="aura-auth-form-side order-lg-2">
                    <div className="aura-auth-blob aura-auth-blob-1" />
                    <div className="aura-auth-blob aura-auth-blob-2" />

                    <div className="aura-auth-card animate-fade-in-up">
                        <div className="aura-auth-logo animate-float">
                            <i className="bi bi-stars" />
                        </div>

                        <h2 className="text-center font-display mb-1">Tạo tài khoản</h2>
                        <p className="text-center text-muted mb-4">
                            Tham gia cùng chúng mình — rất nhiều ưu đãi đang chờ bạn
                        </p>

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="aura-form-label">Họ và tên</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    className="aura-form-control"
                                    placeholder="Tên của bạn"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="aura-form-label">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    className="aura-form-control"
                                    placeholder="ban@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="aura-form-label">Mật khẩu</Form.Label>
                                <div className="position-relative">
                                    <Form.Control
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        className="aura-form-control pe-5"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="position-absolute end-0 top-50 translate-middle-y text-muted"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                                    </Button>
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="aura-form-label">Xác nhận mật khẩu</Form.Label>
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    className="aura-form-control"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Button type="submit" className="btn-aura w-100 py-3" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Đang tạo tài khoản...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-person-plus me-2" />
                                        Đăng ký
                                    </>
                                )}
                            </Button>
                        </Form>

                        <p className="text-center mt-4 mb-0">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="link-aura">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Register;
