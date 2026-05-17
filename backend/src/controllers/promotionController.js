const Promotion = require('../models/Promotion');

const getPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find({ isActive: true })
            .sort({ order: 1, createdAt: -1 });
        res.json(promotions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPromotions };
