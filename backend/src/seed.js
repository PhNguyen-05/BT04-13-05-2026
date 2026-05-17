/**
 * Chạy: node src/seed.js (từ thư mục backend)
 * Nạp dữ liệu mẫu: danh mục, sản phẩm son, khuyến mãi, tin/bài viết
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');

const Category = require('./models/Category');
const Product = require('./models/Product');
const Promotion = require('./models/Promotion');
const Article = require('./models/Article');
const User = require('./models/User');

const categories = [
    { name: 'Son Matte', description: 'Son lì matte lâu trôi' },
    { name: 'Son Kem', description: 'Son kem mịn môi' },
    { name: 'Son Dưỡng', description: 'Son dưỡng ẩm môi' },
];

const seed = async () => {
    await connectDB();

    await Promise.all([
        Category.deleteMany({}),
        Product.deleteMany({}),
        Promotion.deleteMany({}),
        Article.deleteMany({}),
    ]);

    const cats = await Category.insertMany(categories);
    const [matte, kem, duong] = cats;

    const products = [
        {
            name: 'BBIA Last Velvet Lip Tint #24',
            description: 'Son kem lì BBIA tone hồng đất, lên màu chuẩn, không khô môi.',
            price: 189000,
            originalPrice: 249000,
            images: ['/bbia/2.jpg', '/bbia/3.jpg', '/bbia/bìa.jpg'],
            colors: ['#C4786E'],
            stock: 45,
            sold: 128,
            category: kem._id,
            isFeatured: true,
        },
        {
            name: '3CE Soft Lip Lacquer #Lazy Talk',
            description: 'Son bóng 3CE màu cam san hô nhẹ nhàng, phù hợp makeup hàng ngày.',
            price: 320000,
            originalPrice: 390000,
            images: ['/3ce/1.jpg', '/3ce/2.jpg', '/3ce/3.jpg'],
            colors: ['#E8A090'],
            stock: 30,
            sold: 95,
            category: kem._id,
            isFeatured: true,
        },
        {
            name: 'Romand Juicy Lasting Tint #06',
            description: 'Son tint bóng Romand sáp mịn, màu đỏ mận quyến rũ.',
            price: 165000,
            images: ['/romand/1.jpg', '/romand/2.jpg', '/romand/3.jpg'],
            colors: ['#9B2D30'],
            stock: 60,
            sold: 210,
            category: matte._id,
            isFeatured: false,
        },
        {
            name: 'Merzy The First Lipstick #M13',
            description: 'Son lì Merzy tone đỏ gạch vintage, che phủ cao.',
            price: 199000,
            originalPrice: 259000,
            images: ['/merzy/20.png', '/merzy/21.png', '/merzy/bìa.jpg'],
            colors: ['#8B3A3A'],
            stock: 25,
            sold: 156,
            category: matte._id,
            isFeatured: true,
        },
        {
            name: 'Into You Heroine Series #EM08',
            description: 'Son bùn Into You màu hồng đất MLBB, finish mờ tự nhiên.',
            price: 145000,
            images: ['/intoyou/1.jpg', '/intoyou/2.jpg', '/intoyou/3.jpg'],
            colors: ['#B87A6E'],
            stock: 80,
            sold: 88,
            category: kem._id,
            isFeatured: false,
        },
        {
            name: 'Son Dưỡng Aura Lips Rose Balm',
            description: 'Son dưỡng có màu nhẹ, chiết xuất hoa hồng, dưỡng ẩm 24h.',
            price: 99000,
            images: ['/3ce/5.jpg', '/3ce/6.jpg'],
            colors: ['#F4A9B8'],
            stock: 100,
            sold: 42,
            category: duong._id,
            isFeatured: false,
        },
        {
            name: 'BBIA Glow Lip Tint #05',
            description: 'Son tint bóng nhẹ BBIA, màu cam đào tươi trẻ.',
            price: 175000,
            originalPrice: 210000,
            images: ['/bbia/11.jpg', '/bbia/12.jpg'],
            colors: ['#E8A87C'],
            stock: 0,
            sold: 67,
            category: kem._id,
            isFeatured: false,
        },
        {
            name: '3CE Velvet Lip Tint #Daffodil',
            description: 'Son nhung 3CE bestseller, tone cam san hô cult-favorite.',
            price: 295000,
            images: ['/3ce/7.jpg', '/3ce/8.webp', '/3ce/9.jpg'],
            colors: ['#D4846A'],
            stock: 38,
            sold: 302,
            category: matte._id,
            isFeatured: true,
        },
    ];

    await Product.insertMany(products);

    await Promotion.insertMany([
        {
            title: 'Sale 50% Cuối Tuần',
            description: 'Giảm đến 50% cho son matte & kem — chỉ đến Chủ nhật',
            image: '/bbia/bìa.jpg',
            discountText: '-50%',
            link: '/shop?onSale=true',
            order: 1,
        },
        {
            title: 'Freeship Đơn 300K',
            description: 'Miễn phí vận chuyển toàn quốc cho đơn từ 300.000đ',
            image: '/romand/bìa.jpg',
            discountText: 'FREESHIP',
            link: '/shop',
            order: 2,
        },
        {
            title: 'Thành viên mới -15%',
            description: 'Đăng ký tài khoản nhận mã AURA15',
            image: '/3ce/bìa.jpg',
            discountText: '-15%',
            link: '/register',
            order: 3,
        },
    ]);

    await Article.insertMany([
        {
            title: '5 màu son MLBB hot nhất mùa này',
            excerpt: 'Gợi ý tone son MLBB phù hợp mọi tone da châu Á.',
            content: 'Màu MLBB (My Lips But Better) là xu hướng không bao giờ lỗi mốt. Với làn da châu Á, các tone hồng đất, cam san hô và đỏ gạch là lựa chọn an toàn nhất...\n\nHãy thử BBIA #24, Into You EM08 hoặc 3CE Daffodil để có đôi môi tự nhiên nhưng vẫn nổi bật.',
            images: ['/intoyou/4.jpg', '/intoyou/5.jpg', '/bbia/2.jpg'],
            type: 'article',
            categoryLabel: 'Bí quyết làm đẹp',
            isFeatured: true,
        },
        {
            title: 'Aura Lips khai trương cửa hàng online',
            excerpt: 'Chính thức ra mắt website bán son môi chính hãng.',
            content: 'Aura Lips tự hào mang đến bộ sưu tập son môi chính hãng từ BBIA, 3CE, Romand, Merzy, Into You và nhiều thương hiệu khác.\n\nĐăng ký thành viên ngay hôm nay để nhận voucher giảm 15% cho đơn đầu tiên!',
            images: ['/login/login1.jpg', '/logo.png'],
            type: 'news',
            categoryLabel: 'Tin tức',
            isFeatured: true,
        },
        {
            title: 'Cách bôi son lì không bong tróc',
            excerpt: 'Mẹo exfoliate và dưỡng môi trước khi makeup.',
            content: 'Bước 1: Tẩy da chết môi nhẹ nhàng.\nBước 2: Dưỡng môi 5–10 phút, lau bớt dầu.\nBước 3: Kẻ viền môi và bôi son lớp mỏng, blot, lặp lại.\n\nVới son matte, tránh bôi quá dày lớp đầu tiên.',
            images: ['/merzy/22.png', '/merzy/23.png'],
            type: 'article',
            categoryLabel: 'Hướng dẫn',
            isFeatured: false,
        },
    ]);

    const existingUser = await User.findOne({ email: 'member@auralips.vn' });
    if (!existingUser) {
        await User.create({
            name: 'Thành viên Demo',
            email: 'member@auralips.vn',
            password: '123456',
            role: 'customer',
        });
        console.log('👤 Tài khoản demo: member@auralips.vn / 123456');
    }

    console.log('✅ Seed hoàn tất!');
    console.log(`   - ${cats.length} danh mục`);
    console.log(`   - ${products.length} sản phẩm`);
    process.exit(0);
};

seed().catch((err) => {
    console.error('❌ Seed lỗi:', err);
    process.exit(1);
});
