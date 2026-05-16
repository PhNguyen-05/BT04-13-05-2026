import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Card } from 'react-bootstrap';
import api from '../services/api.service';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/auth/register', formData);
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (error) {
            alert(error.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card style={{ width: '400px' }} className="shadow">
                <Card.Body>
                    <h3 className="text-center mb-4">Đăng Ký</h3>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Họ tên</Form.Label>
                            <Form.Control name="name" value={formData.name} onChange={handleChange} required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu</Form.Label>
                            <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
                        </Form.Group>

                        <Button variant="success" type="submit" className="w-100" disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Đăng ký'}
                        </Button>
                    </Form>

                    <div className="text-center mt-3">
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Register;