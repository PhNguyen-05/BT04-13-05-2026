import { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api.service';
import { resolveImageUrl } from '../utils/imageUrl';

const STATUS_STEPS = [
    { key: 'pending', label: 'Đơn hàng mới', icon: 'bi-receipt' },
    { key: 'confirmed', label: 'Đã xác nhận', icon: 'bi-check2-circle' },
    { key: 'preparing', label: 'Shop chuẩn bị hàng', icon: 'bi-box-seam' },
    { key: 'shipping', label: 'Đang giao hàng', icon: 'bi-truck' },
    { key: 'delivered', label: 'Đã giao thành công', icon: 'bi-house-check' },
];

const STATUS_META = {
    pending: { label: 'Đơn hàng mới', variant: 'warning' },
    confirmed: { label: 'Đã xác nhận', variant: 'info' },
    preparing: { label: 'Shop đang chuẩn bị hàng', variant: 'primary' },
    shipping: { label: 'Đang giao hàng', variant: 'secondary' },
    delivered: { label: 'Đã giao thành công', variant: 'success' },
    cancelled: { label: 'Đã hủy', variant: 'danger' },
    cancellation_requested: { label: 'Đã gửi yêu cầu hủy', variant: 'dark' },
};

const PAYMENT_METHOD_LABELS = {
    COD: 'Thanh toán khi nhận hàng',
    E_WALLET: 'Ví điện tử',
    BANK_TRANSFER: 'Chuyển khoản ngân hàng',
};

const PAYMENT_STATUS_LABELS = {
    unpaid: 'Chưa thanh toán',
    pending: 'Đang chờ thanh toán',
    paid: 'Đã thanh toán',
    failed: 'Thanh toán thất bại',
    refunded: 'Đã hoàn tiền',
};

const formatCurrency = (value) => Number(value || 0).toLocaleString('vi-VN') + ' đ';
const formatDateTime = (value) => value ? new Date(value).toLocaleString('vi-VN') : '';

const minutesUntil = (value) => {
    if (!value) return 0;
    return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 60000));
};

const Orders = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get('/orders/my-orders');
            setOrders(res.data || []);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Không thể tải lịch sử đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user]);

    const selectedMeta = useMemo(() => {
        if (!selectedOrder) return null;
        return {
            status: selectedOrder.status,
            isPreparing: selectedOrder.status === 'preparing',
            cancelMinutes: minutesUntil(selectedOrder.autoConfirmAt),
        };
    }, [selectedOrder]);

    const handleCancel = async () => {
        if (!selectedOrder) return;
        setCancelling(true);
        try {
            await api.patch(`/orders/${selectedOrder._id}/cancel`, { reason: cancelReason.trim() });
            setSelectedOrder(null);
            setCancelReason('');
            await fetchOrders();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Không thể hủy đơn hàng.');
        } finally {
            setCancelling(false);
        }
    };

    if (!user) {
        return (
            <Container className="py-5 text-center">
                <h3>Vui lòng đăng nhập để xem đơn hàng</h3>
                <Button className="btn-aura mt-3" onClick={() => navigate('/login')}>
                    Đăng nhập ngay
                </Button>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" className="text-aura" />
                <p className="mt-3 mb-0">Đang tải lịch sử mua hàng...</p>
            </Container>
        );
    }

    return (
        <Container className="py-5 orders-page">
            <header className="aura-section-header mb-4">
                <span className="aura-section-tag">Theo dõi đơn hàng</span>
                <h1 className="aura-section-title font-display">Lịch sử mua hàng</h1>
            </header>

            {message && (
                <Alert variant="danger" className="rounded-4 border-0" onClose={() => setMessage('')} dismissible>
                    {message}
                </Alert>
            )}

            {!orders.length ? (
                <Card className="orders-empty border-0 shadow-sm">
                    <Card.Body className="p-5 text-center">
                        <i className="bi bi-bag-heart orders-empty-icon" />
                        <h4 className="mt-3">Bạn chưa có đơn hàng nào</h4>
                        <p className="text-muted">Những màu son bạn đặt sẽ xuất hiện tại đây để tiện theo dõi.</p>
                        <Button as={Link} to="/shop" className="btn-aura">
                            Mua sắm ngay
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => {
                        const meta = STATUS_META[order.status] || STATUS_META.pending;
                        const cancelMinutes = minutesUntil(order.autoConfirmAt);
                        const canCancel = order.status === 'pending' && cancelMinutes > 0;
                        const canRequestCancel = order.status === 'preparing';
                        const activeIndex = STATUS_STEPS.findIndex((step) => step.key === order.status);

                        return (
                            <Card key={order._id} className="order-card border-0 shadow-sm">
                                <Card.Body className="p-4">
                                    <Row className="g-3 align-items-start">
                                        <Col lg={8}>
                                            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                                                <h5 className="mb-0">Đơn #{order._id.slice(-8).toUpperCase()}</h5>
                                                <Badge bg={meta.variant}>{meta.label}</Badge>
                                            </div>
                                            <p className="text-muted small mb-3">
                                                Đặt lúc {formatDateTime(order.createdAt)}
                                                {order.status === 'pending' && cancelMinutes > 0 && (
                                                    <span> · Có thể hủy trong {cancelMinutes} phút</span>
                                                )}
                                            </p>

                                            <div className="order-timeline">
                                                {STATUS_STEPS.map((step, index) => {
                                                    const reached = order.status === 'delivered' || activeIndex >= index;
                                                    return (
                                                        <div
                                                            key={step.key}
                                                            className={`order-step ${reached ? 'reached' : ''} ${order.status === step.key ? 'current' : ''}`}
                                                        >
                                                            <span className="order-step-icon">
                                                                <i className={`bi ${step.icon}`} />
                                                            </span>
                                                            <span>{step.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {['cancelled', 'cancellation_requested'].includes(order.status) && (
                                                <Alert variant={order.status === 'cancelled' ? 'danger' : 'warning'} className="mt-3 mb-0 py-2">
                                                    {meta.label}
                                                    {order.cancelReason || order.cancelRequestReason ? `: ${order.cancelReason || order.cancelRequestReason}` : ''}
                                                </Alert>
                                            )}
                                        </Col>

                                        <Col lg={4} className="order-summary-box">
                                            <div className="d-flex justify-content-between">
                                                <span>Thanh toán</span>
                                                <strong>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</strong>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Trạng thái tiền</span>
                                                <strong>{PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}</strong>
                                            </div>
                                            <div className="d-flex justify-content-between fs-5 mt-2">
                                                <span>Tổng cộng</span>
                                                <strong className="text-aura">{formatCurrency(order.totalAmount)}</strong>
                                            </div>
                                            {(canCancel || canRequestCancel) && (
                                                <Button
                                                    variant="outline-danger"
                                                    className="w-100 mt-3"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    {canRequestCancel ? 'Gửi yêu cầu hủy' : 'Hủy đơn hàng'}
                                                </Button>
                                            )}
                                        </Col>
                                    </Row>

                                    <div className="order-items mt-4">
                                        {order.items.map((item) => (
                                            <div key={`${order._id}-${item.product}-${item.variant || item.sku}`} className="order-item">
                                                <img src={resolveImageUrl(item.image)} alt={item.name} />
                                                <div>
                                                    <div className="fw-bold">{item.name}</div>
                                                    <small className="text-muted">
                                                        {item.shadeName || item.color || item.sku} · SL: {item.quantity}
                                                    </small>
                                                </div>
                                                <strong>{formatCurrency((item.price || 0) * item.quantity)}</strong>
                                            </div>
                                        ))}
                                    </div>
                                </Card.Body>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Modal show={!!selectedOrder} onHide={() => setSelectedOrder(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedMeta?.isPreparing ? 'Gửi yêu cầu hủy đơn' : 'Hủy đơn hàng'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted">
                        {selectedMeta?.isPreparing
                            ? 'Đơn đang ở bước shop chuẩn bị hàng, yêu cầu hủy sẽ được gửi cho shop xử lý.'
                            : `Bạn còn khoảng ${selectedMeta?.cancelMinutes || 0} phút để hủy đơn trực tiếp.`}
                    </p>
                    <Form.Label>Lý do</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={cancelReason}
                        onChange={(event) => setCancelReason(event.target.value)}
                        placeholder="Ví dụ: muốn đổi màu son hoặc địa chỉ nhận hàng"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setSelectedOrder(null)}>
                        Đóng
                    </Button>
                    <Button variant="danger" onClick={handleCancel} disabled={cancelling}>
                        {cancelling ? 'Đang xử lý...' : selectedMeta?.isPreparing ? 'Gửi yêu cầu' : 'Xác nhận hủy'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Orders;
