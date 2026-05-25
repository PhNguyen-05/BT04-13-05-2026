import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { resolveImageUrl } from '../utils/imageUrl';
import { formatCurrency } from '../utils/formatters';

const getCartItemKey = (item) => `${item.product?._id || item.product}-${item.variant || 'default'}`;

const toCheckoutSelection = (item) => ({
    productId: item.product?._id || item.product,
    variantId: item.variant || null,
});

const Cart = () => {
    const { cart, loading, removeFromCart, updateCartQuantity } = useContext(CartContext);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedKeys, setSelectedKeys] = useState([]);
    const selectionInitializedRef = useRef(false);

    const items = useMemo(() => cart.items || [], [cart.items]);
    const itemKeys = useMemo(() => items.map(getCartItemKey), [items]);

    useEffect(() => {
        setSelectedKeys((prev) => {
            if (!itemKeys.length) {
                selectionInitializedRef.current = false;
                return [];
            }

            if (!selectionInitializedRef.current) {
                selectionInitializedRef.current = true;
                return itemKeys;
            }

            const availableKeys = new Set(itemKeys);
            return prev.filter((key) => availableKeys.has(key));
        });
    }, [itemKeys]);

    const selectedItems = useMemo(
        () => items.filter((item) => selectedKeys.includes(getCartItemKey(item))),
        [items, selectedKeys]
    );

    const selectedQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const selectedTotal = selectedItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
    );
    const allSelected = items.length > 0 && selectedItems.length === items.length;

    const toggleItemSelection = (itemKey) => {
        setSelectedKeys((prev) => (
            prev.includes(itemKey)
                ? prev.filter((key) => key !== itemKey)
                : [...prev, itemKey]
        ));
    };

    const toggleAllSelection = () => {
        setSelectedKeys(allSelected ? [] : itemKeys);
    };

    const handleCheckout = () => {
        if (!selectedItems.length) return;

        const checkoutSelection = selectedItems.map(toCheckoutSelection);
        sessionStorage.setItem('checkoutSelection', JSON.stringify(checkoutSelection));
        navigate('/checkout', { state: { selectedItems: checkoutSelection } });
    };

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

    if (!items.length) {
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
                    <Card className="mb-3 border-0 shadow-sm">
                        <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <Form.Check
                                type="checkbox"
                                id="cart-select-all"
                                label={allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                checked={allSelected}
                                onChange={toggleAllSelection}
                                className="cart-select-all"
                            />
                            <span className="text-muted small">
                                Đã chọn {selectedItems.length}/{items.length} sản phẩm
                            </span>
                        </Card.Body>
                    </Card>

                    {items.map((item) => {
                        const itemKey = getCartItemKey(item);
                        const isSelected = selectedKeys.includes(itemKey);

                        return (
                            <Card key={itemKey} className={`mb-4 shadow-sm border-0 cart-item-card ${isSelected ? 'selected' : ''}`}>
                                <Card.Body>
                                    <Row className="align-items-center g-3">
                                        <Col xs="auto">
                                            <Form.Check
                                                type="checkbox"
                                                id={`cart-select-${itemKey}`}
                                                checked={isSelected}
                                                onChange={() => toggleItemSelection(itemKey)}
                                                aria-label={`Chọn ${item.product?.name || 'sản phẩm'}`}
                                                className="cart-select-check"
                                            />
                                        </Col>
                                        <Col md={3}>
                                            <img
                                                src={resolveImageUrl(item.product?.images?.[0])}
                                                alt={item.product?.name}
                                                className="img-fluid rounded"
                                                style={{ height: '120px', objectFit: 'cover' }}
                                            />
                                        </Col>
                                        <Col md={4}>
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
                                                {formatCurrency(item.product?.price)}
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
                        );
                    })}
                </Col>

                {/* Tóm tắt đơn hàng */}
                <Col lg={4}>
                    <Card className="shadow-sm border-0 sticky-top" style={{ top: '20px' }}>
                        <Card.Body>
                            <h5 className="mb-4">Tóm tắt đơn hàng</h5>

                            <div className="d-flex justify-content-between mb-3">
                                <span>Sản phẩm đã chọn:</span>
                                <strong>{selectedItems.length}</strong>
                            </div>
                             
                            <div className="d-flex justify-content-between mb-3">
                                <span>Tổng số lượng:</span>
                                <strong>{selectedQuantity}</strong>
                            </div>
                             
                            <div className="d-flex justify-content-between mb-4 fs-5">
                                <strong>Tổng tiền:</strong>
                                <strong className="text-danger">
                                    {formatCurrency(selectedTotal)}
                                </strong>
                            </div>

                            {!selectedItems.length && (
                                <p className="text-danger small mb-3">Vui lòng chọn ít nhất một sản phẩm để thanh toán.</p>
                            )}

                            <Button 
                                className="btn-aura w-100 py-3 mb-3"
                                size="lg" 
                                disabled={!selectedItems.length}
                                onClick={handleCheckout}
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
