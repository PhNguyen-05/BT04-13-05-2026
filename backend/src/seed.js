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

const slugify = (value = '') =>
    value
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const SHADE_NAMES = [
    'Nude Whisper',
    'Earlier',
    'Milky Illusion',
    'Pink Scheme',
    'Coral Drench',
    'Tulip Fuzz',
    'Sun Pause',
    'Chili Flame',
    'Driftwood',
    'Quiet Taupe',
];

const expandLineProduct = (line, categoryId) => {
    const lineSlug = slugify(line.name);
    const images = (line.images || []).slice(0, 10);

    return images.map((image, index) => {
        const shadeMeta = line.shades?.[index] || {};
        const shadeCode = shadeMeta.code || String(index + 1).padStart(2, '0');
        const shadeName = shadeMeta.name || SHADE_NAMES[index] || `Shade ${shadeCode}`;
        const stockOffset = (index * 7) % 19;

        return {
            ...line,
            name: `${line.name} ${shadeCode} - ${shadeName}`,
            description: shadeMeta.description || line.description,
            lineName: line.name,
            lineSlug,
            shadeCode,
            shadeName,
            sku: `${slugify(line.categorySlug).toUpperCase()}-${lineSlug.toUpperCase()}-${shadeCode}`,
            images: [image],
            stock: Math.max(0, (line.stock || 0) - stockOffset),
            sold: (line.sold || 0) + index * 3,
            colors: shadeMeta.swatch ? [shadeMeta.swatch] : line.colors || ['#E891A8'],
            category: categoryId,
        };
    });
};

const BRAND_CATEGORIES = [
    {
        name: '3CE',
        slug: '3ce',
        description: 'Thương hiệu son môi Hàn Quốc — tone trendy, chất kem mịn',
        image: '/3ce/bia.jpg',
    },
    {
        name: 'Romand',
        slug: 'romand',
        description: 'Son tint & juicy lip — trong veo, trẻ trung',
        image: '/romand/bia.jpg',
    },
    {
        name: 'Into You',
        slug: 'intoyou',
        description: 'Son bùn & powder — MLBB cult favorite',
        image: '/intoyou/bia.png',
    },
    {
        name: 'Merzy',
        slug: 'merzy',
        description: 'Son lì Merzy — màu đậm, che phủ cao (thư mục merzy)',
        image: '/merzy/bia.png',
    },
    {
        name: 'BBIA',
        slug: 'bbia',
        description: 'BBIA Last Velvet & Glow — giá tốt, màu chuẩn',
        image: '/bbia/bia.jpg',
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
        name: '3CE Blur Water Tint',
        description: 'Tint nước mịn lì với hiệu ứng blur nhẹ môi, cho đôi môi mềm mượt và tự nhiên.',
        price: 275000,
        images: img('3ce/Blur Water Tint', ['1.jpg','2.jpg', '3.jpg', '1.jpg','4.webp', '5.jpg', '6.jpg','7.jpg', '8.webp', '9.jpg','10.jpg']),
        stock: 35,
        sold: 145,
        isFeatured: true,
    },
    {
        categorySlug: '3ce',
        name: '3CE Velvet Lip Tint Plush',
        description: 'Chất son velvet mềm mịn, lên màu chuẩn và giữ môi luôn căng mướt.',
        price: 295000,
        originalPrice: 350000,
        images: img('3ce/Velvet Lip Tint Plush', ['1.webp', '2.webp', '7.webp', '8.webp', '23.webp']),
        shades: [
            {
                code: '01',
                name: 'Speak Up',
                swatch: '#8f2532',
                description: 'Sắc đỏ rượu vang đầy quyến rũ và vô cùng tôn da. Đây là tông màu mang lại vẻ đẹp sang trọng, quyền lực, giúp làm bừng sáng khuôn mặt và cực kỳ phù hợp cho những buổi tiệc hay sự kiện.',
            },
            {
                code: '02',
                name: 'Taupe',
                swatch: '#9a4b3e',
                description: 'Tông nâu đỏ trầm ấm, cá tính và luôn dẫn đầu xu hướng. Màu son này không hề kén tông da, mang đến phong cách tây hiện đại và dễ dàng kết hợp với nhiều layout trang điểm khác nhau.',
            },
            {
                code: '07',
                name: 'Dusky Pink',
                swatch: '#c37a83',
                description: 'Sắc hồng đậu êm dịu, ngọt ngào và thanh lịch. Lựa chọn hoàn hảo cho phong cách trang điểm tự nhiên, trong trẻo, rất phù hợp để sử dụng hàng ngày khi đi học hay đi làm.',
            },
            {
                code: '08',
                name: 'Figtachio',
                swatch: '#c77a61',
                description: 'Tông màu mơ khô nhã nhặn, pha trộn sự tươi tắn và chút trầm tĩnh. Màu son mang lại vẻ ngoài ấm áp, trẻ trung, rạng rỡ nhưng không bị chói.',
            },
            {
                code: '23',
                name: 'Darkest Hour',
                swatch: '#5b1822',
                description: 'Sắc đỏ rượu rum đậm đà, huyền bí và đầy ma mị. Một tông màu hoàn hảo cho những cô nàng theo đuổi phong cách sắc sảo, gợi cảm và muốn tạo điểm nhấn thu hút mọi ánh nhìn.',
            },
        ],
        stock: 40,
        sold: 312,
        isFeatured: true,
    },

    // ——— BBIA ———
    {
        categorySlug: 'bbia',
        name: 'BBIA Glow Tint Edition',
        description: 'Son tint bóng trong trẻo với hiệu ứng glow căng mọng, phù hợp makeup tự nhiên.',
        price: 175000,
        originalPrice: 210000,
        images: img('bbia/Glow Tint Edition', [ '2.jpg', '3.jpg', '11.jpg', '12.jpg', '14.jpg', '24.jpg']),
        stock: 0,
        sold: 88,
        isFeatured: false,
    },
    {
        categorySlug: 'bbia',
        name: 'BBIA Last Velvet Lip Tint',
        description: 'Dòng velvet tint nổi tiếng của BBIA với chất son mềm mịn và bền màu.',
        price: 189000,
        originalPrice: 249000,
        images: img('bbia/Last Velvet Lip Tint', [ '2.webp','12.webp','14.webp','23.webp','35.webp']),
        stock: 45,
        sold: 267,
        isFeatured: true,
    },

    // ——— Into You ———
    {
        categorySlug: 'intoyou',
        name: 'Into You Customized Airy Lip Mud',
        description: 'Son bùn airy siêu nhẹ môi, tạo hiệu ứng matte mịn và thời thượng.',
        price: 145000,
        originalPrice: 185000,
        images: img('intoyou/Customized Airy Lip Mud', [ '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg','7.jpg']),
        stock: 72,
        sold: 203,
        isFeatured: true,
    },
    {
        categorySlug: 'intoyou',
        name: 'Into You SHERO Super Matte Lip',
        description: 'Chất son matte lì chuẩn sắc, tôn môi nổi bật và cá tính.',
        price: 139000,
        images: img('intoyou/SHERO Super Matte Lip', ['1.webp','2.webp','3.webp']),
        stock: 65,
        sold: 156,
        isFeatured: false,
    },

    // ——— Merzy ———
    {
        categorySlug: 'merzy',
        name: 'Merzy New Watery Dew Tint',
        description: 'Tint bóng mọng nước với độ bám màu tốt, mang lại đôi môi căng tràn sức sống.',
        price: 189000,
        images: img('merzy/New Watery Dew Tint', ['20.png', '21.png', '22.png', '23.png', '27.png', '28.png','29.png','30.png']),
        stock: 42,
        sold: 112,
        isFeatured: false,
    },
    {
        categorySlug: 'merzy',
        name: 'Merzy Water Fit Blur Tint',
        description: 'Blur tint mềm môi với finish lì mịn, nhẹ môi và dễ tán.',
        price: 195000,
        originalPrice: 235000,
        images: img('merzy/Water Fit Blur Tint', [ '1.jpg','2.jpg', '3.jpg', '4.jpg', '5.jpg']),
        stock: 38,
        sold: 95,
        isFeatured: true,
    },

    // ——— Romand ———
    {
        categorySlug: 'romand',
        name: 'Romand Dewyful Water Tint',
        description: 'Water tint căng bóng tự nhiên với màu sắc trong trẻo, trẻ trung.',
        price: 165000,
        images: img('romand/Dewyful Water Tint', [ '1.jpg','2.jpg', '3.jpg', '4.jpg', '5.jpg']),
        stock: 55,
        sold: 428,
        isFeatured: true,
    },
    {
        categorySlug: 'romand',
        name: 'Romand The Juicy Lasting Tint',
        description: 'Dòng tint nổi tiếng với hiệu ứng juicy căng mọng và độ bền màu cao.',
        price: 175000,
        originalPrice: 210000,
        images: img('romand/The Juicy Lasting Tint', [ '1.jpg','2.jpg', '3.jpg', '1.jpg','4.jpg', '5.jpg', '6.jpg','7.jpg', '8.jpg', '9.jpg','10.jpg']),
        stock: 48,
        sold: 256,
        isFeatured: true,
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

    const products = PRODUCT_TEMPLATES.flatMap((p) => {
        const { categorySlug, ...rest } = p;
        return expandLineProduct(
            { ...rest, categorySlug },
            catBySlug[categorySlug]._id
        );
    });

    await Product.insertMany(products);

    await Promotion.insertMany([
        {
            title: 'Sale BBIA & Merzy',
            description: 'Giảm giá các dòng son Merzy trong tuần này',
            image: '/merzy/bia2.jpg',
            discountText: '-30%',
            link: '/shop?category=' + catBySlug.merzy._id,
            order: 1,
        },
        {
            title: 'Romand Juicy — Hot deal',
            description: 'Tint juicy Romand giá tốt nhất tháng',
            image: '/romand/bia2.jpg',
            discountText: 'HOT',
            link: '/shop?category=' + catBySlug.romand._id,
            order: 2,
        },
        {
            title: 'Bộ sưu tập 3CE',
            description: 'Khám phá full bộ son 3CE chính hãng',
            image: '/3ce/Blur Water Tint/bia.jpg',
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
            images: img('product', ['into1.jpg', 'into2.jpg', 'into3.jpg']),
            type: 'article',
            categoryLabel: 'Review',
            isFeatured: true,
        },
        {
            title: 'Aura Lips — Đủ 5 thương hiệu son hot',
            excerpt: '3CE, Romand, Into You, Merzy, BBIA chính hãng.',
            content: 'Chúng tôi phân loại sản phẩm theo từng thương hiệu để bạn dễ tìm đúng dòng son yêu thích.\n\nMỗi danh mục có ảnh thật từ bộ sưu tập Aura Lips.',
            images: img('product', ['3ce.jpg', 'merzy.jpg', 'romand.jpg']),
            type: 'news',
            categoryLabel: 'Tin tức',
            isFeatured: true,
        },
        {
            title: 'So sánh Romand Juicy vs Zero Velvet',
            excerpt: 'Nên chọn tint bóng hay velvet?',
            content: 'Juicy Lasting Tint cho finish bóng nhẹ, phù hợp makeup tự nhiên.\nZero Velvet Tint cho môi mờ sang hơn.\n\nCả hai đều có trong danh mục Romand.',
            images: img('product', ['romand1.jpg', 'romand2.jpg']),
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
