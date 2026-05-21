const crypto = require('crypto');
const User = require('../models/User');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOtpEmail, isEmailConfigured } = require('../services/emailService');

const OTP_EXPIRES_MS = 15 * 60 * 1000;

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const sanitizeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    address: user.address || '',
    isVerified: user.isVerified !== false,
});

const getProfileUrl = (role) => (role === 'admin' ? '/admin/profile' : '/user/profile');

const signToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email đã tồn tại' });

        const otp = generateOtp();
        const user = await User.create({
            name,
            email,
            password,
            isVerified: false,
            otp: hashOtp(otp),
            otpExpires: Date.now() + OTP_EXPIRES_MS,
        });

        if (isEmailConfigured()) {
            try {
                await sendOtpEmail(user.email, otp, 'verify');
            } catch (mailError) {
                await User.findByIdAndDelete(user._id);
                console.error('[Aura Lips] Gửi OTP đăng ký thất bại:', mailError.message);
                return res.status(503).json({
                    message: 'Không thể gửi email OTP. Kiểm tra cấu hình SMTP trong file .env.',
                });
            }
        } else {
            user.isVerified = true;
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save({ validateBeforeSave: false });
        }

        res.status(201).json({
            message: isEmailConfigured()
                ? 'Đăng ký thành công. Vui lòng kiểm tra email để nhập mã OTP kích hoạt.'
                : 'Đăng ký thành công (email chưa cấu hình — tài khoản đã được kích hoạt).',
            email: user.email,
            requiresVerification: isEmailConfigured(),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Email hoặc mã OTP không đúng' });
        if (user.isVerified) {
            return res.json({ message: 'Tài khoản đã được kích hoạt. Bạn có thể đăng nhập.' });
        }
        if (!user.otp || !user.otpExpires || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Mã OTP đã hết hạn. Vui lòng gửi lại mã.' });
        }
        if (user.otp !== hashOtp(otp)) {
            return res.status(400).json({ message: 'Email hoặc mã OTP không đúng' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.json({ message: 'Kích hoạt tài khoản thành công. Bạn có thể đăng nhập ngay.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        const genericMessage = 'Nếu email tồn tại và chưa kích hoạt, mã OTP mới đã được gửi.';

        if (!user || user.isVerified) {
            return res.json({ message: genericMessage });
        }

        if (!isEmailConfigured()) {
            return res.status(503).json({ message: 'Hệ thống email chưa được cấu hình.' });
        }

        const otp = generateOtp();
        user.otp = hashOtp(otp);
        user.otpExpires = Date.now() + OTP_EXPIRES_MS;
        await user.save({ validateBeforeSave: false });

        await sendOtpEmail(user.email, otp, 'verify');
        res.json({ message: genericMessage });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });

        if (user.isVerified === false) {
            return res.status(403).json({
                message: 'Tài khoản chưa được kích hoạt. Vui lòng xác nhận OTP qua email.',
                requiresVerification: true,
                email: user.email,
            });
        }

        const token = signToken(user);
        const userData = sanitizeUser(user);

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: userData,
            redirectUrl: getProfileUrl(user.role),
            profileUrl: getProfileUrl(user.role),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!isEmailConfigured()) {
            return res.status(503).json({
                message: 'Hệ thống email chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
            });
        }

        const user = await User.findOne({
            email: new RegExp(`^${email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
        });
        const genericMessage =
            'Chúng tôi đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra hộp thư (và thư mục Spam).';

        if (!user) {
            return res.json({ message: genericMessage });
        }

        const otp = generateOtp();
        user.resetPasswordToken = hashOtp(otp);
        user.resetPasswordExpires = Date.now() + OTP_EXPIRES_MS;
        await user.save({ validateBeforeSave: false });

        try {
            await sendOtpEmail(user.email, otp, 'reset');
        } catch (mailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });
            console.error('[Aura Lips] Gửi OTP thất bại:', mailError.message);
            return res.status(503).json({
                message: 'Không thể gửi email. Kiểm tra cấu hình SMTP trong file .env.',
            });
        }

        res.json({ message: genericMessage, email: user.email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordToken: hashOtp(otp),
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -otp -resetPasswordToken');
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        const orderCount = await Order.countDocuments({ user: user._id });

        res.json({
            user: {
                ...sanitizeUser(user),
                createdAt: user.createdAt,
            },
            stats: { orderCount },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        await user.save();

        res.json({ message: 'Cập nhật hồ sơ thành công', user: sanitizeUser(user) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    verifyEmail,
    resendOtp,
    login,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    changePassword,
};
