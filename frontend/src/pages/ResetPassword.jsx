import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import api from '../services/api.service';

const AUTH_IMAGE = '/login/login3.jpg';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (otp.length !== 6) {
            setError('Mã OTP phải gồm 6 chữ số.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp, password });
            alert('Đặt lại mật khẩu thành công!');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="aura-auth-page">
            <Row className="g-0 min-vh-100">
                <Col lg={5} className="aura-auth-form-side">
                    <div className="aura-auth-blob aura-auth-blob-1" />
                    <div className="aura-auth-blob aura-auth-blob-2" />

                    <div className="aura-auth-card animate-fade-in-up">
                        <div className="aura-auth-logo animate-float">
                            <i className="bi bi-shield-lock-fill" />
                        </div>

                        <h2 className="text-center font-display mb-1">Đặt lại mật khẩu</h2>
                        <p className="text-center text-muted mb-4">Nhập mã OTP từ email và mật khẩu mới</p>

                        {error && (
                            <Alert variant="danger" className="small rounded-4 border-0">
                                {error}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="aura-form-label">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    className="aura-form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="aura-form-label">Mã OTP</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="aura-form-control text-center"
                                    placeholder="000000"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="aura-form-label">Mật khẩu mới</Form.Label>
                                <div className="position-relative">
                                    <Form.Control
                                        type={showPassword ? 'text' : 'password'}
                                        className="aura-form-control pe-5"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
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
                                    className="aura-form-control"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </Form.Group>

                            <Button type="submit" className="btn-aura w-100 py-3 mb-3" disabled={loading}>
                                {loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
                            </Button>
                        </Form>

                        <p className="text-center mt-3 mb-0">
                            <Link to="/forgot-password" className="link-aura me-3">
                                Gửi lại OTP
                            </Link>
                            <Link to="/login" className="link-aura">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </Col>

                <Col lg={7} className="d-none d-lg-block p-0">
                    <div className="aura-auth-visual">
                        <img src={AUTH_IMAGE} alt="Aura Lips" />
                        <div className="aura-auth-visual-overlay" />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ResetPassword;
