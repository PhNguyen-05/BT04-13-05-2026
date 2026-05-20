const Product = require('../models/Product');
const mongoose = require('mongoose');

const slugify = (value = '') =>
    value
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getLineKey = (productOrName) => {
    if (typeof productOrName === 'object' && productOrName?.lineName) {
        return productOrName.lineName;
    }

    const name = typeof productOrName === 'string' ? productOrName : productOrName?.name || '';
    return name
        .replace(/\s*[-–—]\s*[^-–—]+$/i, '')
        .replace(/\s+#?\d{1,2}\s*$/i, '')
        .trim();
};

const getLineSlug = (product) => product.lineSlug || slugify(getLineKey(product));

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
            page,
            limit,
            lineSlug,
        } = req.query;
        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { lineName: { $regex: search, $options: 'i' } },
                { shadeName: { $regex: search, $options: 'i' } },
            ];
        }
        if (category) {
            filter.category = new mongoose.Types.ObjectId(category);
        }
        if (lineSlug) {
            filter.lineSlug = lineSlug;
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

        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.max(1, Number(limit) || 16);
        const skip = (pageNumber - 1) * pageSize;

        let query = Product.find(filter).populate('category');

        if (sort === 'sold') {
            query = query.sort({ sold: -1 });
        } else if (sort === 'views') {
            query = query.sort({ views: -1 });
        } else if (sort === 'newest') {
            query = query.sort({ createdAt: -1 });
        } else if (sort === 'price_asc') {
            query = query.sort({ price: 1 });
        } else if (sort === 'price_desc') {
            query = query.sort({ price: -1 });
        } else {
            query = query.sort({ lineName: 1, shadeCode: 1, createdAt: -1 });
        }

        const total = await Product.countDocuments(filter);
        const products = await query.skip(skip).limit(pageSize);

        res.json({
            data: products,
            page: pageNumber,
            limit: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTopSellingProducts = async (req, res) => {
    try {
        const pageNumber = Math.max(1, Number(req.query.page) || 1);
        const pageSize = Math.max(1, Number(req.query.limit) || 10);
        const skip = (pageNumber - 1) * pageSize;

        const total = await Product.countDocuments();
        const products = await Product.find()
            .populate('category')
            .sort({ sold: -1 })
            .skip(skip)
            .limit(pageSize);

        res.json({
            data: products,
            page: pageNumber,
            limit: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTopViewedProducts = async (req, res) => {
    try {
        const pageNumber = Math.max(1, Number(req.query.page) || 1);
        const pageSize = Math.max(1, Number(req.query.limit) || 10);
        const skip = (pageNumber - 1) * pageSize;

        const total = await Product.countDocuments();
        const products = await Product.find()
            .populate('category')
            .sort({ views: -1 })
            .skip(skip)
            .limit(pageSize);

        res.json({
            data: products,
            page: pageNumber,
            limit: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductLines = async (req, res) => {
    try {
        const lineLimit = Math.max(1, Number(req.query.lineLimit) || 8);
        const productLimit = Math.max(1, Number(req.query.productLimit) || 10);

        const products = await Product.find()
            .populate('category')
            .sort({ lineName: 1, name: 1, shadeCode: 1, createdAt: -1 });

        const groups = new Map();
        products.forEach((product) => {
            const lineSlug = getLineSlug(product);
            const lineName = product.lineName || getLineKey(product);

            if (!groups.has(lineSlug)) {
                groups.set(lineSlug, {
                    lineSlug,
                    lineName,
                    category: product.category,
                    products: [],
                });
            }

            const group = groups.get(lineSlug);
            if (group.products.length < productLimit) {
                group.products.push(product);
            }
        });

        res.json(
            Array.from(groups.values())
                .filter((line) => line.products.length > 0)
                .slice(0, lineLimit)
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        ).populate('category');

        if (!product) return res.status(404).json({ message: 'Khong tim thay san pham' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductLine = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) return res.status(404).json({ message: 'Khong tim thay san pham' });

        const lineKey = getLineKey(product);
        const lineSlug = getLineSlug(product);
        const pattern = new RegExp(`^${escapeRegex(lineKey)}(\\s+0?\\d+|\\s*[-–—]\\s*.+)?$`, 'i');

        const line = await Product.find({
            category: product.category,
            $or: [
                { lineSlug },
                { lineName: lineKey },
                { name: pattern },
            ],
        })
            .populate('category')
            .sort({ shadeCode: 1, name: 1 });

        res.json(line.length > 0 ? line : [product]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSimilarProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Khong tim thay san pham' });

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

module.exports = {
    getProducts,
    getProductById,
    getProductLine,
    getProductLines,
    getSimilarProducts,
    createProduct,
    getTopSellingProducts,
    getTopViewedProducts,
};
