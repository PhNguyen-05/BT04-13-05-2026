const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getSimilarProducts, createProduct } = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');

router.get('/', getProducts);
router.get('/:id/similar', getSimilarProducts);
router.get('/:id', getProductById);
router.post('/', authMiddleware, createProduct);   // Chỉ admin mới được tạo (sau sẽ thêm role check)

module.exports = router;