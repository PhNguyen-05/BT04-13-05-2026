const Article = require('../models/Article');

const getArticles = async (req, res) => {
    try {
        const { type, featured, search, limit } = req.query;
        const filter = {};

        if (type) filter.type = type;
        if (featured === 'true') filter.isFeatured = true;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
            ];
        }

        let query = Article.find(filter).sort({ createdAt: -1 });
        if (limit) query = query.limit(Number(limit));

        const articles = await query;
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }
        article.views += 1;
        await article.save();
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getArticles, getArticleById };
