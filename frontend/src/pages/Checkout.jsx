import { useContext, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import api from '../services/api.service';
import { resolveImageUrl } from '../utils/imageUrl';

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { cart, loading, getTotalPrice, refreshCart } = useContext(CartContext);
    const [form, setForm] = useState({
        fullName: user?.name || '',
        phone: '',
        address: '',
        note: '',
        paymentMethod: 'COD',
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [order, setOrder] = useState(null);

    const items = cart.items || [];
    const subtotal = getTotalPrice();
    const shippingFee = subtotal >= 300000 || subtotal === 0 ? 0 : 25000;
    const grandTotal = subtotal + shippingFee;

    const canSubmit = useMemo(
        () => form.fullName.trim() && form.phone.trim() && form.address.trim() && items.length > 0,
        [form, items.length]
    );

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!canSubmit) return;

        setSubmitting(true);
        setMessage('');
        try {
            const res = await api.post('/orders', {
                shippingAddress: {
                    fullName: form.fullName.trim(),
                    phone: form.phone.trim(),
                    address: form.address.trim(),
                    note: form.note.trim(),
                },
                paymentMethod: form.paymentMethod,
                shippingFee,
            });
            setOrder(res.data.order);
            await refreshCart();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Không thể đặt hàng. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return (
            <Container className="py-5 text-center">
                <h3>Vui lòng đăng nhập để thanh toán</h3>
                <Button className="btn-aura mt-3" onClick={() => navigate('/login')}>
                    Đăng nhập ngay
                </Button>
            </Container>
        );
    }

    if (order) {
        return (
            <Container className="py-5">
                <Card className="checkout-success-card border-0 shadow-sm mx-auto">
                    <Card.Body className="p-4 text-center">
                        <i className="bi bi-check-circle-fill checkout-success-icon" />
                        <h2 className="font-display mt-3">Đặt hàng thành công</h2>
                        <p className="text-muted mb-1">Mã đơn: {order._id}</p>
                        <p className="fw-bold text-aura fs-4">
                            {Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ
                        </p>
                        <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
                            <Button as={Link} to="/shop" className="btn-aura">
                                Tiếp tục mua sắm
                            </Button>
                            <Button as={Link} to="/orders" className="btn-aura-outline">
                                Theo dõi đơn hàng
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    if (loading) {
        return <Container className="py-5 text-center"><h4>Đang tải giỏ hàng...</h4></Container>;
    }

    if (!items.length) {
        return (
            <Container className="py-5 text-center">
                <h2>Giỏ hàng đang trống</h2>
                <p className="text-muted">Hãy chọn một màu son trước khi thanh toán.</p>
                <Button as={Link} to="/shop" className="btn-aura">
                    Quay lại cửa hàng
                </Button>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <header className="aura-section-header mb-4">
                <span className="aura-section-tag">Thanh toán</span>
                <h1 className="aura-section-title font-display">Hoàn tất đơn hàng</h1>
            </header>

            {message && <Alert variant="danger" className="rounded-4 border-0">{message}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                    <Col lg={7}>
                        <Card className="checkout-panel border-0 shadow-sm">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-3">Thông tin giao hàng</h5>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Label>Họ và tên</Form.Label>
                                        <Form.Control
                                            className="aura-form-control"
                                            name="fullName"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label>Số điện thoại</Form.Label>
                                        <Form.Control
                                            className="aura-form-control"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Col>
                                    <Col xs={12}>
                                        <Form.Label>Địa chỉ nhận hàng</Form.Label>
                                        <Form.Control
                                            className="aura-form-control"
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Col>
                                    <Col xs={12}>
                                        <Form.Label>Ghi chú</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            className="aura-form-control"
                                            name="note"
                                            value={form.note}
                                            onChange={handleChange}
                                            placeholder="Ví dụ: giao giờ hành chính"
                                        />
                                    </Col>
                                </Row>

                                <h5 className="fw-bold mt-4 mb-3">Phương thức thanh toán</h5>
                                <div className="checkout-payment-options">
                                    <Form.Check
                                        type="radio"
                                        id="payment-cod"
                                        name="paymentMethod"
                                        value="COD"
                                        label="Thanh toán khi nhận hàng"
                                        checked={form.paymentMethod === 'COD'}
                                        onChange={handleChange}
                                    />
                                    <Form.Check
                                        type="radio"
                                        id="payment-bank"
                                        name="paymentMethod"
                                        value="BANK_TRANSFER"
                                        label="Chuyển khoản ngân hàng"
                                        checked={form.paymentMethod === 'BANK_TRANSFER'}
                                        onChange={handleChange}
                                    />
                                    <Form.Check
                                        type="radio"
                                        id="payment-wallet"
                                        name="paymentMethod"
                                        value="E_WALLET"
                                        label="Thanh toán qua ví điện tử"
                                        checked={form.paymentMethod === 'E_WALLET'}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={5}>
                        <Card className="checkout-panel border-0 shadow-sm sticky-top" style={{ top: 20 }}>
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-3">Đơn hàng của bạn</h5>
                                <div className="checkout-items">
                                    {items.map((item) => (
                                        <div key={`${item.product?._id}-${item.variant || 'default'}`} className="checkout-item">
                                            <img
                                                src={resolveImageUrl(item.product?.images?.[0])}
                                                alt={item.product?.name}
                                            />
                                            <div className="flex-grow-1">
                                                <div className="fw-bold">{item.product?.name}</div>
                                                <small className="text-muted">Số lượng: {item.quantity}</small>
                                            </div>
                                            <strong>
                                                {((item.product?.price || 0) * item.quantity).toLocaleString('vi-VN')} đ
                                            </strong>
                                        </div>
                                    ))}
                                </div>

                                <hr />
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Tạm tính</span>
                                    <strong>{subtotal.toLocaleString('vi-VN')} đ</strong>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    <span>Phí vận chuyển</span>
                                    <strong>{shippingFee ? `${shippingFee.toLocaleString('vi-VN')} đ` : 'Miễn phí'}</strong>
                                </div>
                                <div className="d-flex justify-content-between fs-5 mb-4">
                                    <strong>Tổng cộng</strong>
                                    <strong className="text-aura">{grandTotal.toLocaleString('vi-VN')} đ</strong>
                                </div>

                                <Button
                                    type="submit"
                                    className="btn-aura w-100 py-3"
                                    disabled={!canSubmit || submitting}
                                >
                                    {submitting ? 'Đang đặt hàng...' : 'Đặt hàng'}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default Checkout;
