const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.' },
});

const strictAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.' },
});

module.exports = { authLimiter, strictAuthLimiter };
