const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

const THIRTY_MINUTES = 30 * 60 * 1000;
const USER_CANCEL_WINDOW_MS = THIRTY_MINUTES;
const PAYMENT_METHODS = ['COD', 'E_WALLET', 'BANK_TRANSFER'];
const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled', 'cancellation_requested'];

const appendStatus = (order, status, note) => {
    order.status = status;
    if (!Array.isArray(order.statusHistory)) order.statusHistory = [];
    order.statusHistory.push({ status, note, changedAt: new Date() });
};

const getItemKey = (productId, variantId) => `${productId}-${variantId || 'default'}`;

const getCartItemKey = (item) => {
    const productId = item.product?._id || item.product;
    return getItemKey(productId.toString(), item.variant?.toString());
};

const getSelectedKeys = (selectedItems = []) => {
    if (!Array.isArray(selectedItems)) return new Set();

    return new Set(
        selectedItems
            .filter((item) => item?.productId)
            .map((item) => getItemKey(item.productId.toString(), item.variantId?.toString()))
    );
};

const sanitizeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    address: user.address || '',
    isVerified: user.isVerified !== false,
});

const autoConfirmOrder = async (order) => {
    if (!order || order.status !== 'pending') return order;

    const confirmAt = order.autoConfirmAt || new Date(order.createdAt.getTime() + THIRTY_MINUTES);
    if (confirmAt > new Date()) return order;

    appendStatus(order, 'confirmed', 'Tu dong xac nhan sau 30 phut');
    order.confirmedAt = new Date();
    await order.save();
    return order;
};

const autoConfirmOrders = async (orders) => Promise.all(orders.map(autoConfirmOrder));

const restockOrder = async (order) => {
    await Promise.all((order.items || []).map((item) => {
        if (!item.product || !item.quantity) return Promise.resolve();

        if (item.variant) {
            return Product.updateOne(
                { _id: item.product, 'variants._id': item.variant },
                {
                    $inc: {
                        stock: item.quantity,
                        sold: -item.quantity,
                        'variants.$.stock': item.quantity,
                    },
                }
            );
        }

        return Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity, sold: -item.quantity } }
        );
    }));
};

const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod = 'COD', shippingFee = 0, selectedItems = [] } = req.body;

        if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.address) {
            return res.status(400).json({ message: 'Vui long nhap day du thong tin giao hang' });
        }

        if (!PAYMENT_METHODS.includes(paymentMethod)) {
            return res.status(400).json({ message: 'Phuong thuc thanh toan khong hop le' });
        }

        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Gio hang trong' });
        }

        const selectedKeys = getSelectedKeys(selectedItems);
        const cartItems = selectedKeys.size > 0
            ? cart.items.filter((item) => selectedKeys.has(getCartItemKey(item)))
            : cart.items;

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Khong tim thay san pham da chon trong gio hang' });
        }

        let totalAmount = 0;
        const stockUpdates = [];

        const orderItems = cartItems.map((item) => {
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
            paymentStatus: paymentMethod === 'COD' ? 'unpaid' : 'pending',
            autoConfirmAt: new Date(Date.now() + USER_CANCEL_WINDOW_MS),
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

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                name: shippingAddress.fullName.trim(),
                phone: shippingAddress.phone.trim(),
                address: shippingAddress.address.trim(),
            },
            { new: true, runValidators: true }
        );

        if (selectedKeys.size > 0 && cartItems.length < cart.items.length) {
            cart.items = cart.items.filter((item) => !selectedKeys.has(getCartItemKey(item)));
            await cart.save();
        } else {
            await Cart.findOneAndDelete({ user: req.user.id });
        }

        res.status(201).json({
            message: 'Dat hang thanh cong',
            order,
            user: updatedUser ? sanitizeUser(updatedUser) : undefined,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(await autoConfirmOrders(orders));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
        if (!order) {
            return res.status(404).json({ message: 'Khong tim thay don hang' });
        }

        res.json(await autoConfirmOrder(order));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
        if (!order) {
            return res.status(404).json({ message: 'Khong tim thay don hang' });
        }

        await autoConfirmOrder(order);

        if (['shipping', 'delivered', 'cancelled', 'cancellation_requested'].includes(order.status)) {
            return res.status(400).json({ message: 'Don hang khong the huy o trang thai hien tai' });
        }

        const reason = req.body?.reason || '';
        const minutesSinceOrder = Date.now() - new Date(order.createdAt).getTime();

        if (order.status === 'preparing') {
            appendStatus(order, 'cancellation_requested', 'Nguoi dung gui yeu cau huy don');
            order.cancelRequestedAt = new Date();
            order.cancelRequestReason = reason;
            await order.save();
            return res.json({ message: 'Da gui yeu cau huy don cho shop', order });
        }

        if (order.status !== 'pending' || minutesSinceOrder > USER_CANCEL_WINDOW_MS) {
            return res.status(400).json({ message: 'Chi co the huy don trong 30 phut dau sau khi dat hang' });
        }

        appendStatus(order, 'cancelled', 'Nguoi dung huy don trong 30 phut dau');
        order.cancelledAt = new Date();
        order.cancelReason = reason;
        if (order.paymentStatus === 'paid') order.paymentStatus = 'refunded';
        await order.save();
        await restockOrder(order);

        res.json({ message: 'Huy don hang thanh cong', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status, paymentStatus, note = '' } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Khong tim thay don hang' });
        }

        if (status) {
            if (!ORDER_STATUSES.includes(status)) {
                return res.status(400).json({ message: 'Trang thai don hang khong hop le' });
            }
            const previousStatus = order.status;
            appendStatus(order, status, note || 'Cap nhat trang thai don hang');
            if (status === 'confirmed') order.confirmedAt = new Date();
            if (status === 'cancelled') {
                order.cancelledAt = new Date();
                if (!['cancelled', 'delivered'].includes(previousStatus)) await restockOrder(order);
            }
        }

        if (paymentStatus) {
            order.paymentStatus = paymentStatus;
        }

        await order.save();
        res.json({ message: 'Cap nhat don hang thanh cong', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const skip = (Math.max(1, Number(page)) - 1) * Math.min(50, Number(limit) || 20);
        const take = Math.min(50, Number(limit) || 20);

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('user', 'name email phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(take),
            Order.countDocuments(filter),
        ]);

        await autoConfirmOrders(orders);

        res.json({
            data: orders,
            page: Number(page),
            limit: take,
            total,
            totalPages: Math.ceil(total / take),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus,
};
