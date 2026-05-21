const express = require('express');
const router = express.Router();
const {
    register,
    verifyEmail,
    resendOtp,
    login,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    changePassword,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter, strictAuthLimiter } = require('../middleware/rateLimit');
const {
    registerRules,
    loginRules,
    verifyEmailRules,
    resendOtpRules,
    forgotPasswordRules,
    resetPasswordRules,
    updateProfileRules,
    changePasswordRules,
} = require('../validators/authValidators');

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/verify-email', authLimiter, verifyEmailRules, validate, verifyEmail);
router.post('/resend-otp', authLimiter, resendOtpRules, validate, resendOtp);
router.post('/login', strictAuthLimiter, loginRules, validate, login);
router.post('/forgot-password', authLimiter, forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password', strictAuthLimiter, resetPasswordRules, validate, resetPassword);

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfileRules, validate, updateProfile);
router.patch('/change-password', authMiddleware, changePasswordRules, validate, changePassword);

module.exports = router;
