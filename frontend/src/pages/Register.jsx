import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import AuthLayout from '../components/AuthLayout';
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
        
        const newErrors = validateField('name', formData.name);
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
        <AuthLayout
            logoIcon="bi-stars"
            title="Tạo tài khoản"
            subtitle="Tham gia cùng chúng mình — rất nhiều ưu đãi đang chờ bạn"
            image={AUTH_IMAGE}
            imageAlt="Trang điểm Aura Lips"
            visualBadge="🎁 Ưu đãi thành viên"
            visualTitle="Gia nhập gia đình Aura"
            visualSubtitle="Đăng ký ngay để nhận voucher giảm 15% cho đơn son đầu tiên."
            reverse
            visualChildren={(
                <span className="aura-deco-heart" style={{ bottom: '25%', right: '10%' }}>💕</span>
            )}
        >
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
        </AuthLayout>
    );
};

export default Register;
