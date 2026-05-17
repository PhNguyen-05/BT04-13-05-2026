import { useContext } from 'react';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Cart = () => {
    const { cart, loading, removeFromCart, getTotalPrice, refreshCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    if (!user) {
        return (
            <Container className="py-5 text-center">
                <h3>Vui lòng đăng nhập để xem giỏ hàng</h3>
                <Button variant="dark" onClick={() => navigate('/login')} className="mt-3">
                    Đăng nhập ngay
                </Button>
            </Container>
        );
    }

    if (loading) return <Container className="py-5 text-center"><h4>Đang tải giỏ hàng...</h4></Container>;

    if (!cart.items || cart.items.length === 0) {
        return (
            <Container className="py-5 text-center">
                <h2>Giỏ hàng của bạn đang trống</h2>
                <p className="text-muted">Hãy thêm một số sản phẩm son môi yêu thích</p>
                <Button as={Link} to="/shop" variant="dark" size="lg" className="rounded-pill">
                    Khám phá Cửa hàng
                </Button>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4 fw-bold">
                <i className="bi bi-bag me-2"></i>Giỏ Hàng Của Bạn
            </h2>

            <Row>
                {/* Danh sách sản phẩm */}
                <Col lg={8}>
                    {cart.items.map((item) => (
                        <Card key={item.product?._id} className="mb-4 shadow-sm border-0">
                            <Card.Body>
                                <Row className="align-items-center">
                                    <Col md={3}>
                                        <img 
                                            src={item.product?.images?.[0] || 'https://via.placeholder.com/150'} 
                                            alt={item.product?.name}
                                            className="img-fluid rounded"
                                            style={{ height: '120px', objectFit: 'cover' }}
                                        />
                                    </Col>
                                    <Col md={5}>
                                        <h5>{item.product?.name}</h5>
                                        {item.color && <p className="text-muted small">Màu: {item.color}</p>}
                                    </Col>
                                    <Col md={2} className="text-center">
                                        <h6 className="text-danger fw-bold">
                                            {item.product?.price.toLocaleString('vi-VN')} ₫
                                        </h6>
                                        <small>x {item.quantity}</small>
                                    </Col>
                                    <Col md={2} className="text-end">
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => removeFromCart(item.product?._id)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ))}
                </Col>

                {/* Tóm tắt đơn hàng */}
                <Col lg={4}>
                    <Card className="shadow-sm border-0 sticky-top" style={{ top: '20px' }}>
                        <Card.Body>
                            <h5 className="mb-4">Tóm tắt đơn hàng</h5>
                            
                            <div className="d-flex justify-content-between mb-3">
                                <span>Tổng số lượng:</span>
                                <strong>{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</strong>
                            </div>
                            
                            <div className="d-flex justify-content-between mb-4 fs-5">
                                <strong>Tổng tiền:</strong>
                                <strong className="text-danger">
                                    {getTotalPrice().toLocaleString('vi-VN')} ₫
                                </strong>
                            </div>

                            <Button 
                                variant="dark" 
                                size="lg" 
                                className="w-100 rounded-pill py-3 mb-3"
                                onClick={() => navigate('/checkout')}
                            >
                                Tiến hành thanh toán
                            </Button>

                            <Button 
                                as={Link} 
                                to="/shop" 
                                variant="outline-secondary" 
                                className="w-100 rounded-pill"
                            >
                                Tiếp tục mua sắm
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Cart;