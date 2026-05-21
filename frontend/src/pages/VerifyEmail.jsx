import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import api from '../services/api.service';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);
        try {
            const res = await api.post('/auth/verify-email', { email, otp });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            setIsError(true);
            setMessage(error.response?.data?.message || 'Xác nhận thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        setMessage('');
        setIsError(false);
        try {
            const res = await api.post('/auth/resend-otp', { email });
            setMessage(res.data.message);
        } catch (error) {
            setIsError(true);
            setMessage(error.response?.data?.message || 'Không thể gửi lại OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="aura-auth-page">
            <Row className="g-0 min-vh-100 justify-content-center">
                <Col lg={5} className="aura-auth-form-side">
                    <div className="aura-auth-card animate-fade-in-up">
                        <div className="aura-auth-logo animate-float">
                            <i className="bi bi-envelope-check-fill" />
                        </div>
                        <h2 className="text-center font-display mb-1">Kích hoạt tài khoản</h2>
                        <p className="text-center text-muted mb-4">
                            Nhập mã OTP 6 số đã gửi đến email của bạn
                        </p>

                        {message && (
                            <Alert variant={isError ? 'danger' : 'success'} className="small rounded-4 border-0">
                                {message}
                            </Alert>
                        )}

                        <Form onSubmit={handleVerify}>
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
                            <Form.Group className="mb-4">
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
                            <Button type="submit" className="btn-aura w-100 py-3 mb-2" disabled={loading}>
                                {loading ? 'Đang xác nhận...' : 'Kích hoạt tài khoản'}
                            </Button>
                        </Form>

                        <Button variant="link" className="link-aura w-100" onClick={handleResend} disabled={loading || !email}>
                            Gửi lại mã OTP
                        </Button>

                        <p className="text-center mt-3 mb-0">
                            <Link to="/login" className="link-aura">Quay lại đăng nhập</Link>
                        </p>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default VerifyEmail;
