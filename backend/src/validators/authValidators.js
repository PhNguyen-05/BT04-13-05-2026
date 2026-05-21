const { body } = require('express-validator');

const registerRules = [
    body('name').trim().notEmpty().withMessage('Họ tên không được để trống').isLength({ max: 80 }).withMessage('Họ tên tối đa 80 ký tự'),
    body('email').trim().isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
];

const loginRules = [
    body('email').trim().isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
    body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
];

const verifyEmailRules = [
    body('email').trim().isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('Mã OTP phải gồm 6 chữ số').isNumeric().withMessage('Mã OTP chỉ gồm số'),
];

const resendOtpRules = [
    body('email').trim().isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
];

const forgotPasswordRules = [
    body('email').trim().isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
];

const resetPasswordRules = [
    body('email').trim().isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('Mã OTP phải gồm 6 chữ số').isNumeric().withMessage('Mã OTP chỉ gồm số'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
];

const updateProfileRules = [
    body('name').optional().trim().notEmpty().withMessage('Họ tên không được để trống').isLength({ max: 80 }),
    body('phone').optional().trim().isLength({ max: 20 }).withMessage('Số điện thoại không hợp lệ'),
    body('address').optional().trim().isLength({ max: 300 }).withMessage('Địa chỉ quá dài'),
];

const changePasswordRules = [
    body('currentPassword').notEmpty().withMessage('Vui lòng nhập mật khẩu hiện tại'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
];

module.exports = {
    registerRules,
    loginRules,
    verifyEmailRules,
    resendOtpRules,
    forgotPasswordRules,
    resetPasswordRules,
    updateProfileRules,
    changePasswordRules,
};
