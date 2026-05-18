const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    color: { type: String, required: true },
    colorName: String,
    images: [{ type: String }],
    stock: { type: Number, default: 100 },
    sku: String
}, { _id: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    originalPrice: Number,
    images: [{ type: String }],
    colors: [{ type: String }],
    variants: [variantSchema],
    stock: { type: Number, default: 100 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    isFeatured: { type: Boolean, default: false },
    sold: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);