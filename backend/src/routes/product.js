const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    getProductLine,
    getSimilarProducts,
    createProduct,
    getTopSellingProducts,
    getTopViewedProducts,
    getProductLines,
} = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');

router.get('/top-selling', getTopSellingProducts);
router.get('/top-viewed', getTopViewedProducts);
router.get('/lines', getProductLines);
router.get('/', getProducts);
router.get('/:id/similar', getSimilarProducts);
router.get('/:id/line', getProductLine);
router.get('/:id', getProductById);
router.post('/', authMiddleware, createProduct);   // Chỉ admin mới được tạo (sau sẽ thêm role check)

module.exports = router;
