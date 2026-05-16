require('dotenv').config();
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')?.[1];

    if (!token) {
        return res.status(401).json({
            message: 'Bạn chưa đăng nhập hoặc thiếu token',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };
        next();
    } catch {
        return res.status(401).json({
            message: 'Token không hợp lệ hoặc đã hết hạn',
        });
    }
};

module.exports = auth;
