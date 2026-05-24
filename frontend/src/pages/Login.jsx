import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import AuthLayout from '../components/AuthLayout';
import api from '../services/api.service';
import { useAuth } from '../hooks/useAuth';

const LOGIN_IMAGES = [
    '/login/login1.jpg',
    '/login/login2.jpg',
    '/login/login3.jpg',
];

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

    // Random ảnh thay đổi mỗi 10 giây
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => 
                (prevIndex + 1) % LOGIN_IMAGES.length
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
        const newErrors = validateField('email', email);
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
            const roleProfileUrl = res.data.redirectUrl || res.data.profileUrl || (res.data.user?.role === 'admin' ? '/admin/profile' : '/user/profile');
            const target = candidate && !isProfilePath
                ? candidate
                : res.data.user?.role === 'admin'
                    ? roleProfileUrl
                    : '/';
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
        <AuthLayout
            logoIcon="bi-heart-fill"
            title="Chào mừng trở lại"
            subtitle="Đăng nhập để khám phá bộ sưu tập son pastel dễ thương nhất"
            image={LOGIN_IMAGES[currentImageIndex]}
            imageAlt="Son môi Aura Lips"
            imageKey={currentImageIndex}
            visualBadge="✨ Bộ sưu tập mới"
            visualTitle="Vẻ đẹp bắt đầu từ đôi môi"
            visualSubtitle="Hàng trăm sắc son pastel — dịu dàng, quyến rũ, dễ thương như chính bạn."
            visualChildren={(
                <>
                    <span className="aura-deco-heart" style={{ top: '15%', right: '12%' }}>💗</span>
                    <span className="aura-deco-heart" style={{ top: '40%', left: '8%', animationDelay: '1s' }}>🌸</span>
                </>
            )}
        >
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
        </AuthLayout>
    );
};

export default Login;
