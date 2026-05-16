const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    originalPrice: Number,
    images: [{ type: String }],
    colors: [{ type: String }],
    stock: { type: Number, default: 100 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    isFeatured: { type: Boolean, default: false },
    sold: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);