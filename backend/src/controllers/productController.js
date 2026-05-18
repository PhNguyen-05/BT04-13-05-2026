const Product = require('../models/Product');
const mongoose = require('mongoose');

const getProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            sort,
            featured,
            onSale,
            inStock,
        } = req.query;
        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (category) {
            // Convert string category ID to MongoDB ObjectId
            filter.category = new mongoose.Types.ObjectId(category);
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (featured === 'true') {
            filter.isFeatured = true;
        }
        if (onSale === 'true') {
            filter.originalPrice = { $exists: true, $gt: 0 };
        }
        if (inStock === 'true') {
            filter.stock = { $gt: 0 };
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
        } else {
            query = query.sort({ createdAt: -1 });
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

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Tên dòng sản phẩm (bỏ số màu cuối): "Romand Juicy 01" → "Romand Juicy" */
const getLineKey = (name) => name.replace(/\s+0?\d+\s*$/i, '').trim();

const getProductLine = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

        const lineKey = getLineKey(product.name);
        const pattern = new RegExp(`^${escapeRegex(lineKey)}\\s+0?\\d+\\s*$`, 'i');

        const line = await Product.find({
            category: product.category,
            name: pattern,
        })
            .populate('category')
            .sort({ name: 1 });

        res.json(line.length > 0 ? line : [product]);
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

module.exports = { getProducts, getProductById, getProductLine, getSimilarProducts, createProduct };
