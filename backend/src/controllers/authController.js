const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendPasswordResetEmail, isEmailConfigured } = require('../services/emailService');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email đã tồn tại' });

        const user = await User.create({ name, email, password });
        res.status(201).json({ message: 'Đăng ký thành công', user: { id: user._id, name, email, role: user.role } });
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

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Vui lòng nhập email' });

        if (!isEmailConfigured()) {
            return res.status(503).json({
                message: 'Hệ thống email chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
            });
        }

        const user = await User.findOne({
            email: new RegExp(`^${email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
        });
        const genericMessage =
            'Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư (và thư mục Spam).';

        if (!user) {
            return res.json({ message: genericMessage });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        try {
            await sendPasswordResetEmail(user.email, resetUrl);
        } catch (mailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });

            console.error('[Aura Lips] Gửi email thất bại:', mailError.message);
            return res.status(503).json({
                message: 'Không thể gửi email. Kiểm tra cấu hình SMTP trong file .env.',
            });
        }

        res.json({ message: genericMessage });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ message: 'Thiếu mã xác nhận hoặc mật khẩu mới' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });
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

module.exports = { register, login, forgotPassword, resetPassword };
