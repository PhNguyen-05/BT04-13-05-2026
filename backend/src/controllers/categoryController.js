const Category = require('../models/Category');

const getCategories = async (req, res) => {
    try {
        const order = ['3ce', 'romand', 'intoyou', 'merzy', 'bbia'];
        const categories = await Category.find().sort({ name: 1 });
        categories.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCategories };
