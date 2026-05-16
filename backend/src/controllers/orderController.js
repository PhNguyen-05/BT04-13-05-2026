const Order = require('../models/Order');
const Cart = require('../models/Cart');

const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod = 'COD' } = req.body;
        
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng trống' });
        }

        let totalAmount = 0;
        const orderItems = cart.items.map(item => {
            totalAmount += item.product.price * item.quantity;
            return {
                product: item.product._id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                color: item.color
            };
        });

        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod
        });

        // Xóa giỏ hàng sau khi đặt hàng
        await Cart.findOneAndDelete({ user: req.user.id });

        res.status(201).json({ message: 'Đặt hàng thành công', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, getMyOrders };