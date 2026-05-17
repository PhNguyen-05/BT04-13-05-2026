const express = require('express');
const router = express.Router();
const { getCart, addToCart } = require('../controllers/cartController');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, getCart);
router.post('/add', authMiddleware, addToCart);
router.put('/update', authMiddleware, async (req, res) => { /* sẽ bổ sung sau */ });
router.delete('/remove/:productId', authMiddleware, async (req, res) => { /* sẽ bổ sung sau */ });

module.exports = router;