const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        sku: String,
        name: String,
        lineName: String,
        shadeCode: String,
        shadeName: String,
        image: String,
        price: Number,
        quantity: Number,
        color: String,
        variant: { type: mongoose.Schema.Types.ObjectId }
    }],
    shippingFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    shippingAddress: {
        fullName: String,
        phone: String,
        address: String,
        note: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled', 'cancellation_requested'],
        default: 'pending'
    },
    statusHistory: [{
        status: String,
        note: String,
        changedAt: { type: Date, default: Date.now }
    }],
    paymentMethod: {
        type: String,
        enum: ['COD', 'E_WALLET', 'BANK_TRANSFER'],
        default: 'COD'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'pending', 'paid', 'failed', 'refunded'],
        default: 'unpaid'
    },
    autoConfirmAt: Date,
    confirmedAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    cancelRequestedAt: Date,
    cancelRequestReason: String
}, { timestamps: true });

orderSchema.pre('save', function(next) {
    if (this.isNew) {
        this.autoConfirmAt = this.autoConfirmAt || new Date(Date.now() + 30 * 60 * 1000);
        if (!this.statusHistory?.length) {
            this.statusHistory = [{
                status: this.status || 'pending',
                note: 'Don hang moi',
                changedAt: this.createdAt || new Date()
            }];
        }
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
