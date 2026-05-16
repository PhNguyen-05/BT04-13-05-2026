const Product = require('../models/Product');

const getProducts = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, sort } = req.query;
        const filter = {};

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }
        if (category) {
            filter.category = category;
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        let query = Product.find(filter).populate('category');

        if (sort === 'sold') {
            query = query.sort({ sold: -1 });
        } else if (sort === 'newest') {
            query = query.sort({ createdAt: -1 });
        } else if (sort === 'price_asc') {
            query = query.sort({ price: 1 });
        } else if (sort === 'price_desc') {
            query = query.sort({ price: -1 });
        }

        const products = await query;
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSimilarProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

        const similar = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
        })
            .populate('category')
            .limit(4);

        res.json(similar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProducts, getProductById, getSimilarProducts, createProduct };
