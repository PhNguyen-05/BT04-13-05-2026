const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    excerpt: { type: String },
    content: { type: String, required: true },
    images: [{ type: String }],
    type: {
        type: String,
        enum: ['news', 'article'],
        default: 'article',
    },
    categoryLabel: { type: String, default: 'Tin tức' },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);
