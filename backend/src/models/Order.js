const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number,
        color: String
    }],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
        fullName: String,
        phone: String,
        address: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: { type: String, default: 'COD' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);