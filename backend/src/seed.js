/**
 * Chạy: npm run seed (từ thư mục backend)
 * Danh mục = 5 thương hiệu trong frontend/public/
 * Ảnh sản phẩm: đường dẫn /{thư-mục}/{file}
 */
require('dotenv').config();
const connectDB = require('./config/database');

const Category = require('./models/Category');
const Product = require('./models/Product');
const Promotion = require('./models/Promotion');
const Article = require('./models/Article');
const User = require('./models/User');

/** @param {string} folder @param {string[]} files */
const img = (folder, files) => files.map((f) => `/${folder}/${f}`);

const BRAND_CATEGORIES = [
    {
        name: '3CE',
        slug: '3ce',
        description: 'Thương hiệu son môi Hàn Quốc — tone trendy, chất kem mịn',
        image: '/3ce/bìa.jpg',
    },
    {
        name: 'Romand',
        slug: 'romand',
        description: 'Son tint & juicy lip — trong veo, trẻ trung',
        image: '/romand/bìa.jpg',
    },
    {
        name: 'Into You',
        slug: 'intoyou',
        description: 'Son bùn & powder — MLBB cult favorite',
        image: '/intoyou/1.jpg',
    },
    {
        name: 'Merzy',
        slug: 'merzy',
        description: 'Son lì Merzy — màu đậm, che phủ cao (thư mục merzy)',
        image: '/merzy/bìa.jpg',
    },
    {
        name: 'BBIA',
        slug: 'bbia',
        description: 'BBIA Last Velvet & Glow — giá tốt, màu chuẩn',
        image: '/bbia/bìa.jpg',
    },
];

/**
 * Mỗi phần tử: { name, description, price, originalPrice?, images, stock, sold, isFeatured }
 * categorySlug gán sau khi insert categories
 */
const PRODUCT_TEMPLATES = [
    // ——— 3CE ———
    {
        categorySlug: '3ce',
        name: '3CE Velvet Lip Tint',
        description: 'Son nhung 3CE bán chạy, lên màu chuẩn, finish mờ elegant.',
        price: 295000,
        originalPrice: 350000,
        images: img('3ce', ['bìa.jpg', '1.jpg', '2.jpg']),
        stock: 40,
        sold: 312,
        isFeatured: true,
    },
    {
        categorySlug: '3ce',
        name: '3CE Soft Lip Lacquer',
        description: 'Son bóng nhẹ, màu cam san hô tươi tắn.',
        price: 320000,
        originalPrice: 390000,
        images: img('3ce', ['3.jpg', '4.webp', '5.jpg']),
        stock: 28,
        sold: 98,
        isFeatured: true,
    },
    {
        categorySlug: '3ce',
        name: '3CE Blur Water Tint',
        description: 'Tint nước mờ ảo, không dính, bền màu cả ngày.',
        price: 275000,
        images: img('3ce', ['6.jpg', '7.jpg']),
        stock: 35,
        sold: 145,
        isFeatured: false,
    },
    {
        categorySlug: '3ce',
        name: '3CE Glaze Lip Tint',
        description: 'Son bóng glaze trong suốt, môi căng mọng.',
        price: 285000,
        images: img('3ce', ['8.webp', '9.jpg', '10.jpg']),
        stock: 22,
        sold: 87,
        isFeatured: false,
    },

    // ——— Romand ———
    {
        categorySlug: 'romand',
        name: 'Romand Juicy Lasting Tint',
        description: 'Tint juicy bóng nhẹ, màu đỏ mận quyến rũ.',
        price: 165000,
        images: img('romand', ['bìa.jpg', '1.jpg', '2.jpg']),
        stock: 55,
        sold: 428,
        isFeatured: true,
    },
    {
        categorySlug: 'romand',
        name: 'Romand Zero Velvet Tint',
        description: 'Son velvet mờ, không khô môi.',
        price: 175000,
        originalPrice: 210000,
        images: img('romand', ['3.jpg', '4.jpg', '5.jpg']),
        stock: 48,
        sold: 256,
        isFeatured: true,
    },
    {
        categorySlug: 'romand',
        name: 'Romand Glasting Water Tint',
        description: 'Water tint trong veo, glow tự nhiên.',
        price: 169000,
        images: img('romand', ['6.jpg', '7.jpg']),
        stock: 60,
        sold: 189,
        isFeatured: false,
    },
    {
        categorySlug: 'romand',
        name: 'Romand See Through Matte',
        description: 'Son matte trong suốt, nhẹ tênh trên môi.',
        price: 185000,
        images: img('romand', ['8.jpg', '9.jpg', '10.jpg']),
        stock: 33,
        sold: 134,
        isFeatured: false,
    },

    // ——— Into You ———
    {
        categorySlug: 'intoyou',
        name: 'Into You Heroine Series EM08',
        description: 'Son bùn MLBB hồng đất, finish mờ tự nhiên.',
        price: 145000,
        originalPrice: 185000,
        images: img('intoyou', ['1.jpg', '2.jpg', '3.jpg']),
        stock: 72,
        sold: 203,
        isFeatured: true,
    },
    {
        categorySlug: 'intoyou',
        name: 'Into You Air Series',
        description: 'Son không khí siêu nhẹ, không nặng môi.',
        price: 139000,
        images: img('intoyou', ['4.jpg', '5.jpg']),
        stock: 65,
        sold: 156,
        isFeatured: false,
    },
    {
        categorySlug: 'intoyou',
        name: 'Into You Water Mist',
        description: 'Tint sương mịn, tươi trẻ cả ngày.',
        price: 155000,
        images: img('intoyou', ['6.jpg', '7.jpg']),
        stock: 50,
        sold: 91,
        isFeatured: false,
    },

    // ——— Merzy (thư mục merzy) ———
    {
        categorySlug: 'merzy',
        name: 'Merzy The First Lipstick M13',
        description: 'Son lì đỏ gạch vintage, che phủ cao.',
        price: 199000,
        originalPrice: 259000,
        images: img('merzy', ['bìa.jpg', '20.png', '21.png']),
        stock: 30,
        sold: 178,
        isFeatured: true,
    },
    {
        categorySlug: 'merzy',
        name: 'Merzy Watery Dew Tint',
        description: 'Tint dew căng mọng, không dính.',
        price: 189000,
        images: img('merzy', ['22.png', '23.png']),
        stock: 42,
        sold: 112,
        isFeatured: false,
    },
    {
        categorySlug: 'merzy',
        name: 'Merzy Mood Fit Lip',
        description: 'Son mood fit — bám màu, không trôi vệ.',
        price: 195000,
        originalPrice: 235000,
        images: img('merzy', ['27.png', '28.png', '29.png', '30.png']),
        stock: 38,
        sold: 95,
        isFeatured: true,
    },

    // ——— BBIA ———
    {
        categorySlug: 'bbia',
        name: 'BBIA Last Velvet Lip Tint',
        description: 'Velvet tint BBIA — hồng đất bestseller.',
        price: 189000,
        originalPrice: 249000,
        images: img('bbia', ['bìa.jpg', '2.jpg', '3.jpg']),
        stock: 45,
        sold: 267,
        isFeatured: true,
    },
    {
        categorySlug: 'bbia',
        name: 'BBIA Glow Lip Tint',
        description: 'Tint bóng nhẹ cam đào tươi trẻ.',
        price: 175000,
        originalPrice: 210000,
        images: img('bbia', ['11.jpg', '12.jpg']),
        stock: 0,
        sold: 88,
        isFeatured: false,
    },
    {
        categorySlug: 'bbia',
        name: 'BBIA Last Powder Lipstick',
        description: 'Son powder mờ, không khô.',
        price: 199000,
        images: img('bbia', ['14.jpg', '24.jpg']),
        stock: 36,
        sold: 142,
        isFeatured: false,
    },
];

const seed = async () => {
    await connectDB();

    await Promise.all([
        Category.deleteMany({}),
        Product.deleteMany({}),
        Promotion.deleteMany({}),
        Article.deleteMany({}),
    ]);

    const cats = await Category.insertMany(BRAND_CATEGORIES);
    const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c]));

    const products = PRODUCT_TEMPLATES.map((p) => {
        const { categorySlug, ...rest } = p;
        return {
            ...rest,
            category: catBySlug[categorySlug]._id,
            colors: rest.colors || ['#E891A8'],
        };
    });

    await Product.insertMany(products);

    await Promotion.insertMany([
        {
            title: 'Sale BBIA & Merzy',
            description: 'Giảm giá các dòng son BBIA, Merzy trong tuần này',
            image: '/bbia/bìa.jpg',
            discountText: '-30%',
            link: '/shop?category=' + catBySlug.bbia._id,
            order: 1,
        },
        {
            title: 'Romand Juicy — Hot deal',
            description: 'Tint juicy Romand giá tốt nhất tháng',
            image: '/romand/bìa.jpg',
            discountText: 'HOT',
            link: '/shop?category=' + catBySlug.romand._id,
            order: 2,
        },
        {
            title: 'Bộ sưu tập 3CE',
            description: 'Khám phá full bộ son 3CE chính hãng',
            image: '/3ce/bìa.jpg',
            discountText: '3CE',
            link: '/shop?category=' + catBySlug['3ce']._id,
            order: 3,
        },
    ]);

    await Article.insertMany([
        {
            title: 'Review son Into You EM08',
            excerpt: 'Màu MLBB dễ dùng mỗi ngày.',
            content: 'Into You EM08 là tone hồng đất hoàn hảo cho da châu Á. Chất bùn mịn, không bột, có thể dùng chùm môi hoặc full lip.\n\nXem thêm sản phẩm tại danh mục Into You.',
            images: img('intoyou', ['4.jpg', '5.jpg', '6.jpg']),
            type: 'article',
            categoryLabel: 'Review',
            isFeatured: true,
        },
        {
            title: 'Aura Lips — Đủ 5 thương hiệu son hot',
            excerpt: '3CE, Romand, Into You, Merzy, BBIA chính hãng.',
            content: 'Chúng tôi phân loại sản phẩm theo từng thương hiệu để bạn dễ tìm đúng dòng son yêu thích.\n\nMỗi danh mục có ảnh thật từ bộ sưu tập Aura Lips.',
            images: img('3ce', ['bìa.jpg', '1.jpg']),
            type: 'news',
            categoryLabel: 'Tin tức',
            isFeatured: true,
        },
        {
            title: 'So sánh Romand Juicy vs Zero Velvet',
            excerpt: 'Nên chọn tint bóng hay velvet?',
            content: 'Juicy Lasting Tint cho finish bóng nhẹ, phù hợp makeup tự nhiên.\nZero Velvet Tint cho môi mờ sang hơn.\n\nCả hai đều có trong danh mục Romand.',
            images: img('romand', ['1.jpg', '3.jpg', '6.jpg']),
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

    console.log('✅ Seed hoàn tất — 5 danh mục thương hiệu:');
    cats.forEach((c) => {
        const count = products.filter(
            (p) => p.category.toString() === c._id.toString()
        ).length;
        console.log(`   • ${c.name} (${c.slug}) — ${count} sản phẩm — ảnh: ${c.image}`);
    });
    console.log(`   Tổng: ${products.length} sản phẩm`);
    process.exit(0);
};

seed().catch((err) => {
    console.error('❌ Seed lỗi:', err);
    process.exit(1);
});
