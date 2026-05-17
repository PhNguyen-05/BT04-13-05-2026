const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart) cart = { items: [] };
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, color } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
        if (product.stock <= 0) {
            return res.status(400).json({ message: 'Sản phẩm đã hết hàng' });
        }

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        const currentQty = itemIndex > -1 ? cart.items[itemIndex].quantity : 0;
        const newQty = currentQty + quantity;

        if (newQty > product.stock) {
            return res.status(400).json({
                message: `Chỉ còn ${product.stock} sản phẩm trong kho`,
            });
        }

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = newQty;
        } else {
            cart.items.push({ product: productId, quantity, color });
        }

        await cart.save();
        const updated = await Cart.findOne({ user: req.user.id }).populate('items.product');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || quantity == null) {
            return res.status(400).json({ message: 'Thiếu productId hoặc quantity' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng trống' });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
        }

        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else if (quantity > product.stock) {
            return res.status(400).json({
                message: `Chỉ còn ${product.stock} sản phẩm trong kho`,
            });
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        const updated = await Cart.findOne({ user: req.user.id }).populate('items.product');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng trống' });
        }

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );
        await cart.save();

        const updated = await Cart.findOne({ user: req.user.id }).populate('items.product');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
