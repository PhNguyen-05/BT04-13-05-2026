const express = require('express');
const router = express.Router();
const { getPromotions } = require('../controllers/promotionController');

router.get('/', getPromotions);

module.exports = router;
