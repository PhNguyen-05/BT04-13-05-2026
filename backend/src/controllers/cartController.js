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
        const { productId, quantity = 1, color, variantId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        // Check stock - from variant if provided, else from product
        let availableStock = product.stock;
        if (variantId && product.variants && product.variants.length > 0) {
            const variant = product.variants.find(v => v._id.toString() === variantId);
            if (variant) {
                availableStock = variant.stock;
            }
        }

        if (availableStock <= 0) {
            return res.status(400).json({ message: 'Sản phẩm đã hết hàng' });
        }

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }

        // Find item by product AND variant
        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId && 
                      (!variantId || item.variant?.toString() === variantId)
        );

        const currentQty = itemIndex > -1 ? cart.items[itemIndex].quantity : 0;
        const newQty = currentQty + quantity;

        if (newQty > availableStock) {
            return res.status(400).json({
                message: `Chỉ còn ${availableStock} sản phẩm trong kho`,
            });
        }

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = newQty;
        } else {
            cart.items.push({ product: productId, quantity, color, variant: variantId || null });
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
        const { productId, quantity, variantId } = req.body;
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

        // Find item by product AND variant
        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId && 
                      (!variantId || item.variant?.toString() === variantId)
        );
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
        }

        // Get available stock from variant or product
        let availableStock = product.stock;
        if (variantId && product.variants && product.variants.length > 0) {
            const variant = product.variants.find(v => v._id.toString() === variantId);
            if (variant) {
                availableStock = variant.stock;
            }
        }

        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else if (quantity > availableStock) {
            return res.status(400).json({
                message: `Chỉ còn ${availableStock} sản phẩm trong kho`,
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
        const { productId, variantId } = req.params;
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng trống' });
        }

        cart.items = cart.items.filter((item) => {
            if (item.product.toString() !== productId) return true;
            if (variantId) return item.variant?.toString() !== variantId;
            return item.variant != null;
        });
        await cart.save();

        const updated = await Cart.findOne({ user: req.user.id }).populate('items.product');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
