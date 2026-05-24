import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import AuthLayout from '../components/AuthLayout';
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
        <AuthLayout
            logoIcon="bi-key-fill"
            title="Quên mật khẩu"
            subtitle="Nhập email đăng ký — chúng mình sẽ gửi mã OTP 6 số qua email"
            image={AUTH_IMAGE}
            imageAlt="Aura Lips"
            visualBadge="🔐 Bảo mật"
            visualTitle="Khôi phục tài khoản an toàn"
            visualSubtitle="Mã OTP có hiệu lực trong 15 phút."
        >
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
        </AuthLayout>
    );
};

export default ForgotPassword;
