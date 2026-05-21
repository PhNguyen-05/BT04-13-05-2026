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
    const [errors, setErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const validateField = (name, value) => {
        const newErrors = { ...errors };
        if (name === 'name') {
            if (!value.trim()) {
                newErrors.name = 'Họ và tên không được để trống';
            } else if (value.trim().length < 2) {
                newErrors.name = 'Họ và tên phải có ít nhất 2 ký tự';
            } else {
                delete newErrors.name;
            }
        } else if (name === 'email') {
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
        } else if (name === 'confirmPassword') {
            if (!value) {
                newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
            } else if (value !== formData.password) {
                newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            } else {
                delete newErrors.confirmPassword;
            }
        }
        return newErrors;
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (touchedFields[name]) {
            setErrors(validateField(name, value));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouchedFields({ ...touchedFields, [name]: true });
        setErrors(validateField(name, value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let newErrors = {};
        newErrors = validateField('name', formData.name);
        Object.assign(newErrors, validateField('email', formData.email));
        Object.assign(newErrors, validateField('password', formData.password));
        Object.assign(newErrors, validateField('confirmPassword', formData.confirmPassword));
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouchedFields({ name: true, email: true, password: true, confirmPassword: true });
            // Focus on first error field
            const fieldOrder = ['name', 'email', 'password', 'confirmPassword'];
            for (const field of fieldOrder) {
                if (newErrors[field]) {
                    document.querySelector(`input[name="${field}"]`)?.focus();
                    break;
                }
            }
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
            const apiError = error.response?.data?.message || 'Đăng ký thất bại';
            setErrors({ submit: apiError });
            setTouchedFields({ name: true, email: true, password: true, confirmPassword: true });
            // Focus on email if it's an email conflict error
            if (apiError.toLowerCase().includes('email')) {
                document.querySelector('input[name="email"]')?.focus();
            }
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
                                    className={`aura-form-control ${errors.name ? 'is-invalid' : ''}`}
                                    placeholder="Tên của bạn"
                                    value={formData.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                />
                                {errors.name && <span className="aura-form-error">{errors.name}</span>}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="aura-form-label">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                     className={`aura-form-control ${errors.email ? 'is-invalid' : ''}`}
                                    placeholder="abc@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
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
                                        value={formData.password}
                                        onChange={handleChange}
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

                            <Form.Group className="mb-4">
                                <Form.Label className="aura-form-label">Xác nhận mật khẩu</Form.Label>
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                     className={`aura-form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                />
                                {errors.confirmPassword && <span className="aura-form-error">{errors.confirmPassword}</span>}
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
