import { useContext } from 'react';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { resolveImageUrl } from '../utils/imageUrl';

const Cart = () => {
    const { cart, loading, removeFromCart, updateCartQuantity, getTotalPrice } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    if (!user) {
        return (
            <Container className="py-5 text-center">
                <h3>Vui lòng đăng nhập để xem giỏ hàng</h3>
                <Button className="btn-aura mt-3" onClick={() => navigate('/login')}>
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
                <Button as={Link} to="/shop" className="btn-aura btn-lg">
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
                    {cart.items.map((item, index) => (
                        <Card key={`${item.product?._id}-${item.variant || 'default'}`} className="mb-4 shadow-sm border-0">
                            <Card.Body>
                                <Row className="align-items-center">
                                    <Col md={3}>
                                        <img 
                                            src={resolveImageUrl(item.product?.images?.[0])} 
                                            alt={item.product?.name}
                                            className="img-fluid rounded"
                                            style={{ height: '120px', objectFit: 'cover' }}
                                        />
                                    </Col>
                                    <Col md={5}>
                                        <h5>{item.product?.name}</h5>
                                        {item.color && <p className="text-muted small">Màu: {item.color}</p>}
                                        {item.variant && (
                                            <p className="text-muted small">
                                                Biến thể: {item.product?.variants?.find(v => v._id === item.variant)?.colorName || item.color || 'N/A'}
                                            </p>
                                        )}
                                    </Col>
                                    <Col md={2} className="text-center">
                                        <h6 className="text-danger fw-bold">
                                            {(item.product?.price || 0).toLocaleString('vi-VN')} ₫
                                        </h6>
                                        <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                disabled={item.quantity <= 1}
                                                onClick={() => updateCartQuantity(item.product?._id, item.quantity - 1, item.variant)}
                                            >
                                                −
                                            </Button>
                                            <span className="fw-semibold">{item.quantity}</span>
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                disabled={item.quantity >= (item.product?.stock || 1)}
                                                onClick={() => updateCartQuantity(item.product?._id, item.quantity + 1, item.variant)}
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </Col>
                                    <Col md={2} className="text-end">
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => removeFromCart(item.product?._id, item.variant)}
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
                                className="btn-aura w-100 py-3 mb-3"
                                size="lg" 
                                onClick={() => navigate('/checkout')}
                            >
                                Tiến hành thanh toán
                            </Button>

                            <Button 
                                as={Link} 
                                to="/shop" 
                                className="btn-aura-outline w-100"
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