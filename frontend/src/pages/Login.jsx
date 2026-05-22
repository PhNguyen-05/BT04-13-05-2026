import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Row, Col, Form, Button } from 'react-bootstrap';
import api from '../services/api.service';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [errors, setErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    
    const loginImages = [
        '/login/login1.jpg',
        '/login/login2.jpg',
        '/login/login3.jpg',
    ];

    // Random ảnh thay đổi mỗi 10 giây
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => 
                (prevIndex + 1) % loginImages.length
            );
        }, 10000); // 10000ms = 10 giây

        // Cleanup khi component unmount
        return () => clearInterval(interval);
    }, []);
    const validateField = (name, value) => {
        const newErrors = { ...errors };
        if (name === 'email') {
            if (!value.trim()) {
                newErrors.email = 'Email không được để trống';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                newErrors.email = 'Email không hợp lệ';
            } else {
                delete newErrors.email;
            }
        } else if (name === 'password') {
            if (!value) {
                newErrors.password = 'Mật khẩu không được để trống';
            } else if (value.length < 6) {
                newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            } else {
                delete newErrors.password;
            }
        }
        return newErrors;
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        if (touchedFields.email) {
            setErrors(validateField('email', value));
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        if (touchedFields.password) {
            setErrors(validateField('password', value));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouchedFields({ ...touchedFields, [name]: true });
        setErrors(validateField(name, name === 'email' ? email : password));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate all fields
        let newErrors = {};
        newErrors = validateField('email', email);
        const passwordErrors = validateField('password', password);
        Object.assign(newErrors, passwordErrors);
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouchedFields({ email: true, password: true });
            // Focus on first error field
            if (newErrors.email) {
                document.querySelector('input[name="email"]')?.focus();
            } else if (newErrors.password) {
                document.querySelector('input[name="password"]')?.focus();
            }
            return;
        }
        
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            login(res.data.user, res.data.token);
            const candidate = location.state?.from;
            const isProfilePath = candidate === '/user/profile' || candidate === '/admin/profile' || candidate === '/profile';
            const target = candidate && !isProfilePath ? candidate : '/';
            navigate(target, { replace: true });
        } catch (error) {
            const data = error.response?.data;
            if (data?.requiresVerification) {
                navigate(`/verify-email?email=${encodeURIComponent(data.email || email)}`);
                return;
            }
            // Show API error on email field if it's a login error
            if (data?.message) {
                setErrors({ email: data.message });
                setTouchedFields({ email: true });
                document.querySelector('input[name="email"]')?.focus();
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="aura-auth-page">
            <Row className="g-0 min-vh-100">
                {/* Phần Form */}
                <Col lg={5} className="aura-auth-form-side">
                    <div className="aura-auth-blob aura-auth-blob-1" />
                    <div className="aura-auth-blob aura-auth-blob-2" />

                    <div className="aura-auth-card animate-fade-in-up">
                        <div className="aura-auth-logo animate-float">
                            <i className="bi bi-heart-fill" />
                        </div>

                        <h2 className="text-center font-display mb-1">Chào mừng trở lại</h2>
                        <p className="text-center text-muted mb-4">
                            Đăng nhập để khám phá bộ sưu tập son pastel dễ thương nhất
                        </p>

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="aura-form-label">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    className={`aura-form-control ${errors.email ? 'is-invalid' : ''}`}
                                    
                                    placeholder="ban@email.com"
                                    value={email}
                                    onChange={handleEmailChange}
                                    onBlur={handleBlur}
                                    
                                    required
                                />
                                {errors.email && <span className="aura-form-error">{errors.email}</span>}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="aura-form-label">Mật khẩu</Form.Label>
                                <div className="position-relative">
                                    <Form.Control
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        className={`aura-form-control pe-5 ${errors.password ? 'is-invalid' : ''}`}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        onBlur={handleBlur}
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
                                {errors.password && <span className="aura-form-error">{errors.password}</span>}
                            </Form.Group>

                            <div className="text-end mb-4">
                                <Link to="/forgot-password" className="link-aura small">
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            <Button type="submit" className="btn-aura w-100 py-3 mb-3" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Đang đăng nhập...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-box-arrow-in-right me-2" />
                                        Đăng nhập
                                    </>
                                )}
                            </Button>
                        </Form>

                        <div className="aura-divider">hoặc</div>

                        <div className="d-grid gap-2">
                            <Button
                                type="button"
                                className="btn-aura-ghost py-2"
                                onClick={() => alert('Đăng nhập Google đang được phát triển.')}
                            >
                                <i className="bi bi-google me-2" />
                                Tiếp tục với Google
                            </Button>
                        </div>

                        <p className="text-center mt-4 mb-0">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="link-aura">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </Col>

                {/* Phần Hình ảnh bên phải - Random mỗi 5 giây */}
                <Col lg={7} className="d-none d-lg-block p-0">
                    <div className="aura-auth-visual">
                        <img 
                            src={loginImages[currentImageIndex]} 
                            alt="Son môi Aura Lips" 
                            key={currentImageIndex} 
                        />
                        <div className="aura-auth-visual-overlay" />
                        <div className="aura-auth-visual-content animate-fade-in-up delay-2">
                            <span className="aura-hero-badge">✨ Bộ sưu tập mới</span>
                            <h2 className="font-display">Vẻ đẹp bắt đầu từ đôi môi</h2>
                            <p className="lead mb-0" style={{ color: 'var(--text-soft)' }}>
                                Hàng trăm sắc son pastel — dịu dàng, quyến rũ, dễ thương như chính bạn.
                            </p>
                        </div>
                        <span className="aura-deco-heart" style={{ top: '15%', right: '12%' }}>💗</span>
                        <span className="aura-deco-heart" style={{ top: '40%', left: '8%', animationDelay: '1s' }}>🌸</span>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Login;
