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
        res.json({ message: 'Thêm vào giỏ hàng thành công', cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCart, addToCart };
