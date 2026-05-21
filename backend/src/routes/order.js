const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus,
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/role');

router.post('/', authMiddleware, createOrder);
router.get('/my-orders', authMiddleware, getMyOrders);
router.get('/admin/all', authMiddleware, adminMiddleware, getAllOrders);
router.get('/:id', authMiddleware, getOrderById);
router.patch('/:id/cancel', authMiddleware, cancelOrder);
router.patch('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);

module.exports = router;
