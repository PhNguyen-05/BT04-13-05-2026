import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import api from '../services/api.service';

const AUTH_IMAGE = '/login/login2.jpg';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
            if (res.data.email) {
                setTimeout(() => {
                    navigate(`/reset-password?email=${encodeURIComponent(res.data.email)}`);
                }, 2000);
            }
        } catch (error) {
            setIsError(true);
            setMessage(error.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.');
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
                            <i className="bi bi-key-fill" />
                        </div>

                        <h2 className="text-center font-display mb-1">Quên mật khẩu</h2>
                        <p className="text-center text-muted mb-4">
                            Nhập email đăng ký — chúng mình sẽ gửi mã OTP 6 số qua email
                        </p>

                        {message && (
                            <Alert variant={isError ? 'danger' : 'success'} className="small rounded-4 border-0">
                                {message}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label className="aura-form-label">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    className="aura-form-control"
                                    placeholder="ban@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Button type="submit" className="btn-aura w-100 py-3 mb-3" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-envelope me-2" />
                                        Gửi mã OTP qua email
                                    </>
                                )}
                            </Button>
                        </Form>

                        <p className="text-center mt-3 mb-0">
                            <Link to="/login" className="link-aura">
                                <i className="bi bi-arrow-left me-1" />
                                Quay lại đăng nhập
                            </Link>
                        </p>
                    </div>
                </Col>

                <Col lg={7} className="d-none d-lg-block p-0">
                    <div className="aura-auth-visual">
                        <img src={AUTH_IMAGE} alt="Aura Lips" />
                        <div className="aura-auth-visual-overlay" />
                        <div className="aura-auth-visual-content animate-fade-in-up delay-2">
                            <span className="aura-hero-badge">🔐 Bảo mật</span>
                            <h2 className="font-display">Khôi phục tài khoản an toàn</h2>
                            <p className="lead mb-0" style={{ color: 'var(--text-soft)' }}>
                                Mã OTP có hiệu lực trong 15 phút.
                            </p>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ForgotPassword;
