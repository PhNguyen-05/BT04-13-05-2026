const nodemailer = require('nodemailer');

let transporter = null;

const isEmailConfigured = () => {
    const { SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_SERVICE } = process.env;
    return Boolean(SMTP_USER && SMTP_PASS && (SMTP_HOST || SMTP_SERVICE));
};

const getTransporter = () => {
    if (!isEmailConfigured()) return null;
    if (transporter) return transporter;

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SERVICE } = process.env;

    if (SMTP_SERVICE) {
        transporter = nodemailer.createTransport({
            service: SMTP_SERVICE,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
    } else {
        transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
    }

    return transporter;
};

const verifyEmailConnection = async () => {
    if (!isEmailConfigured()) {
        console.warn('[Aura Lips] Email chưa cấu hình — quên mật khẩu sẽ không gửi được. Thêm SMTP_* vào backend/.env');
        return false;
    }

    try {
        const transport = getTransporter();
        await transport.verify();
        console.log('[Aura Lips] Kết nối SMTP thành công — sẵn sàng gửi email.');
        return true;
    } catch (err) {
        console.error('[Aura Lips] Lỗi kết nối SMTP:', err.message);
        transporter = null;
        return false;
    }
};

const sendPasswordResetEmail = async (to, resetUrl) => {
    const transport = getTransporter();
    if (!transport) {
        throw new Error('EMAIL_NOT_CONFIGURED');
    }

    const from = process.env.SMTP_FROM || `"Aura Lips" <${process.env.SMTP_USER}>`;
    const subject = 'Đặt lại mật khẩu — Aura Lips';

    const text = [
        'Bạn đã yêu cầu đặt lại mật khẩu tài khoản Aura Lips.',
        '',
        'Mở liên kết sau (có hiệu lực 1 giờ):',
        resetUrl,
        '',
        'Nếu bạn không yêu cầu, hãy bỏ qua email này.',
    ].join('\n');

    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #fffaf8;">
            <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background: linear-gradient(135deg, #f4a9b8, #e891a8); color: #fff; font-size: 24px;">&#9829;</span>
            </div>
            <h2 style="color: #3d2f36; text-align: center; margin: 0 0 16px;">Đặt lại mật khẩu</h2>
            <p style="color: #5a4550; line-height: 1.6;">Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản <strong>Aura Lips</strong>.</p>
            <p style="color: #5a4550; line-height: 1.6;">Nhấn nút bên dưới để tạo mật khẩu mới. Liên kết có hiệu lực <strong>1 giờ</strong>.</p>
            <p style="text-align: center; margin: 28px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f4a9b8, #e891a8); color: #ffffff; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-weight: bold; font-size: 16px;">
                    Đặt lại mật khẩu
                </a>
            </p>
            <p style="color: #8f7a84; font-size: 13px; word-break: break-all;">Hoặc copy link: <a href="${resetUrl}" style="color: #e891a8;">${resetUrl}</a></p>
            <hr style="border: none; border-top: 1px solid #fce8ee; margin: 24px 0;" />
            <p style="color: #8f7a84; font-size: 12px; margin: 0;">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
        </div>
    `;

    await transport.sendMail({ from, to, subject, text, html });
};

const sendOtpEmail = async (to, otp, purpose = 'verify') => {
    const transport = getTransporter();
    if (!transport) {
        throw new Error('EMAIL_NOT_CONFIGURED');
    }

    const from = process.env.SMTP_FROM || `"Aura Lips" <${process.env.SMTP_USER}>`;
    const isReset = purpose === 'reset';
    const subject = isReset
        ? 'Mã OTP đặt lại mật khẩu — Aura Lips'
        : 'Mã OTP kích hoạt tài khoản — Aura Lips';
    const title = isReset ? 'Đặt lại mật khẩu' : 'Kích hoạt tài khoản';
    const intro = isReset
        ? 'Bạn đã yêu cầu đặt lại mật khẩu. Nhập mã OTP bên dưới trên trang web (có hiệu lực 15 phút).'
        : 'Cảm ơn bạn đã đăng ký Aura Lips. Nhập mã OTP bên dưới để kích hoạt tài khoản (có hiệu lực 15 phút).';

    const text = [intro, '', `Mã OTP: ${otp}`, '', 'Nếu bạn không yêu cầu, hãy bỏ qua email này.'].join('\n');

    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #fffaf8;">
            <h2 style="color: #3d2f36; text-align: center;">${title}</h2>
            <p style="color: #5a4550; line-height: 1.6;">${intro}</p>
            <p style="text-align: center; margin: 28px 0;">
                <span style="display: inline-block; background: #fce8ee; color: #3d2f36; padding: 16px 32px; border-radius: 12px; font-size: 28px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
            </p>
            <p style="color: #8f7a84; font-size: 12px; text-align: center;">Mã có hiệu lực trong 15 phút.</p>
        </div>
    `;

    await transport.sendMail({ from, to, subject, text, html });
};

module.exports = {
    isEmailConfigured,
    verifyEmailConnection,
    sendPasswordResetEmail,
    sendOtpEmail,
};

