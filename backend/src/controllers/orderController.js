const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod = 'COD', shippingFee = 0 } = req.body;

        if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.address) {
            return res.status(400).json({ message: 'Vui long nhap day du thong tin giao hang' });
        }

        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Gio hang trong' });
        }

        let totalAmount = 0;
        const stockUpdates = [];

        const orderItems = cart.items.map((item) => {
            const product = item.product;
            const quantity = Math.max(1, Number(item.quantity) || 1);
            let availableStock = product.stock;
            let selectedVariant = null;

            if (item.variant && product.variants?.length) {
                selectedVariant = product.variants.find(
                    (variant) => variant._id.toString() === item.variant.toString()
                );
                if (selectedVariant) {
                    availableStock = selectedVariant.stock;
                }
            }

            if (availableStock < quantity) {
                throw new Error(`${product.name} chi con ${availableStock} san pham`);
            }

            totalAmount += product.price * quantity;
            stockUpdates.push({ product, variantId: item.variant, quantity });

            return {
                product: product._id,
                sku: selectedVariant?.sku || product.sku,
                name: product.name,
                lineName: product.lineName,
                shadeCode: product.shadeCode,
                shadeName: selectedVariant?.colorName || product.shadeName,
                image: selectedVariant?.images?.[0] || product.images?.[0],
                price: product.price,
                quantity,
                color: item.color || selectedVariant?.color || product.colors?.[0],
                variant: item.variant || null,
            };
        });

        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            shippingFee,
            totalAmount: totalAmount + Number(shippingFee || 0),
            shippingAddress,
            paymentMethod,
        });

        await Promise.all(stockUpdates.map(({ product, variantId, quantity }) => {
            if (variantId) {
                return Product.updateOne(
                    { _id: product._id, 'variants._id': variantId },
                    {
                        $inc: {
                            stock: -quantity,
                            sold: quantity,
                            'variants.$.stock': -quantity,
                        },
                    }
                );
            }

            return Product.updateOne(
                { _id: product._id },
                { $inc: { stock: -quantity, sold: quantity } }
            );
        }));

        await Cart.findOneAndDelete({ user: req.user.id });

        res.status(201).json({ message: 'Dat hang thanh cong', order });
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
