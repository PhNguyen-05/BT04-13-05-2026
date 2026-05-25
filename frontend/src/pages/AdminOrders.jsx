import { useCallback, useEffect, useState } from 'react';
import { Container, Table, Form, Badge, Alert, Spinner } from 'react-bootstrap';
import api from '../services/api.service';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatters';

const STATUS_OPTIONS = [
    { value: '', label: 'Tất cả' },
    { value: 'pending', label: 'Đơn mới' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'preparing', label: 'Chuẩn bị hàng' },
    { value: 'shipping', label: 'Đang giao' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'cancellation_requested', label: 'Yêu cầu hủy' },
    { value: 'cancelled', label: 'Đã hủy' },
];

const STATUS_LABELS = {
    pending: 'Đơn mới',
    confirmed: 'Đã xác nhận',
    preparing: 'Chuẩn bị hàng',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
    cancellation_requested: 'Yêu cầu hủy',
};

const AdminOrders = () => {
    const { isAdmin } = useAuth();
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const params = statusFilter ? `?status=${statusFilter}` : '';
            const res = await api.get(`/orders/admin/all${params}`);
            setOrders(res.data.data || []);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        if (!isAdmin) return undefined;
        const timer = setTimeout(fetchOrders, 0);
        return () => clearTimeout(timer);
    }, [fetchOrders, isAdmin]);

    const handleStatusChange = async (orderId, status) => {
        setUpdatingId(orderId);
        setMessage('');
        try {
            await api.patch(`/orders/${orderId}/status`, { status, note: 'Admin cập nhật trạng thái' });
            setMessage('Cập nhật trạng thái thành công');
            await fetchOrders();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="aura-profile-page">
        <Container className="py-4 py-lg-5">
            <div className="aura-profile-hero mb-4">
                <p className="aura-profile-eyebrow mb-2">
                    <i className="bi bi-gear me-2" />
                    Quản trị
                </p>
                <h1 className="font-display mb-2">Quản lý đơn hàng</h1>
                <p className="text-muted mb-0">Cập nhật trạng thái đơn cho khách hàng</p>
            </div>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div className="d-none" />
                <Form.Select
                    style={{ maxWidth: 220 }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </Form.Select>
            </div>

            {message && <Alert variant="info" className="rounded-4 border-0">{message}</Alert>}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" />
                </div>
            ) : (
                <div className="table-responsive aura-profile-card p-3">
                    <Table hover className="align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Ngày đặt</th>
                                <th>Cập nhật</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted py-4">Chưa có đơn hàng</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id}>
                                        <td><code>{order._id.slice(-8).toUpperCase()}</code></td>
                                        <td>
                                            <div>{order.user?.name || order.shippingAddress?.fullName}</div>
                                            <small className="text-muted">{order.user?.email}</small>
                                        </td>
                                        <td>{formatCurrency(order.totalAmount)}</td>
                                        <td>
                                            <Badge bg="light" text="dark" className="me-1">
                                                {STATUS_LABELS[order.status] || order.status}
                                            </Badge>
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                                        <td>
                                            <Form.Select
                                                size="sm"
                                                value={order.status}
                                                disabled={updatingId === order._id}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                style={{ minWidth: 160 }}
                                            >
                                                {STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </Form.Select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
        </div>
    );
};

export default AdminOrders;
