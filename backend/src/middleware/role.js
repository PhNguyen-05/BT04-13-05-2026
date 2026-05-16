const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này (Admin only)' });
    }
    next();
};

module.exports = { adminMiddleware };