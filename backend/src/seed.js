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

const shades = (items) => items.map(([code, name, swatch]) => ({ code, name, swatch }));

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
    {
        categorySlug: '3ce',
        name: '3CE Gummy Oil Tint',
        description: 'Tint dau bong mong, tao lop mau trong veo va cam giac moi mem muot.',
        price: 285000,
        originalPrice: 335000,
        images: img('3ce/Gummy Oil Tint', ['1.JPG', '2.JPG', '3.JPG', '4.JPG', '5.JPG']),
        shades: shades([['01', 'BAGEL PEACH', '#d88670'], ['02', 'MELTING GUMMY', '#c45f68'], ['03', 'GLOWY', '#d96f7a'], ['04', 'ROSE GUMMY', '#b94b5c'], ['05', 'MOCHA SYRUP', '#8f4d42']]),
        stock: 36,
        sold: 118,
        isFeatured: true,
    },
    {
        categorySlug: '3ce',
        name: '3CE Misty Lip Bare',
        description: 'Son tint mem nhe voi lop mau mo suong, de dung cho makeup hang ngay.',
        price: 279000,
        images: img('3ce/Misty Lip Bare', ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg']),
        shades: shades([['01', 'PINK SCHEME', '#c7838d'], ['02', 'EARLIER', '#b76a62'], ['03', 'NUDE WHISPER', '#c48b79'], ['04', 'CORAL DRENCH', '#d06a59'], ['05', 'TULIP FUZZ', '#bd5b76']]),
        stock: 34,
        sold: 96,
        isFeatured: false,
    },
    {
        categorySlug: '3ce',
        name: '3CE Blur Water Tint',
        description: 'Tint nuoc min li voi hieu ung blur nhe moi, cho doi moi mem muot va tu nhien.',
        price: 275000,
        images: img('3ce/Blur Water Tint', ['1.jpg', '2.jpg', '3.jpg', '4.webp', '5.jpg', '6.jpg', '7.jpg', '8.webp', '9.jpg', '10.jpg']),
        shades: shades([['01', 'DEAR MARCH', '#b94a4b'], ['02', 'DOUBLE WIND', '#ad5146'], ['03', 'LAYDOWN', '#be6a62'], ['04', 'PINK GUAVA', '#d46c77'], ['05', 'PLAY OFF', '#a33e42'], ['06', 'CASUAL AFFAIR', '#b87564'], ['07', 'CORAL MOON', '#d16b57'], ['08', 'SPOT PLAYER', '#bc5163'], ['09', 'BREEZE WAY', '#c98875'], ['10', 'MORE PEACH', '#df8a67']]),
        stock: 35,
        sold: 145,
        isFeatured: true,
    },
    {
        categorySlug: '3ce',
        name: '3CE Velvet Lip Tint Plush',
        description: 'Ch?t son velvet m?m m?n, l?n m?u chu?n v? gi? m?i lu?n c?ng m??t.',
        price: 295000,
        originalPrice: 350000,
        images: img('3ce/Velvet Lip Tint Plush', ['1.webp', '2.webp', '7.webp', '8.webp', '23.webp']),
        shades: shades([['01', 'SPEAK UP', '#8f2532'], ['02', 'TAUPE', '#9a4b3e'], ['07', 'DUSKY PINK', '#c37a83'], ['08', 'FIGTACHIO', '#c77a61'], ['23', 'DARKEST HOUR', '#5b1822']]),
        stock: 40,
        sold: 312,
        isFeatured: true,
    },
    {
        categorySlug: '3ce',
        name: '3CE Cashmere Hug Lipstick',
        description: 'Son thoi mem min, om moi nhe voi lop mau cashmere am ap va sang.',
        price: 315000,
        originalPrice: 365000,
        images: img('3ce/Cashmere Hug Lipstick', ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg']),
        shades: shades([['01', 'HUSH RED', '#9d2f36'], ['02', 'OAT', '#b87b64'], ['03', 'BUDDY', '#bd665b'], ['04', 'COZY WHISPER', '#c9917b'], ['05', 'DREAMY', '#c56f79']]),
        stock: 31,
        sold: 121,
        isFeatured: false,
    },
    {
        categorySlug: 'bbia',
        name: 'BBIA Glow Tint Edition',
        description: 'Son tint b?ng trong tr?o v?i hi?u ?ng glow c?ng m?ng, ph? h?p makeup t? nhi?n.',
        price: 175000,
        originalPrice: 210000,
        images: img('bbia/Glow Tint Edition', ['2.jpg', '3.jpg', '11.jpg', '12.jpg', '14.jpg', '24.jpg']),
        shades: shades([['02', 'EXTRA BOUNCE', '#c96f72'], ['03', 'EXTRA RED', '#b5313a'], ['11', 'CALM BOSS', '#b96a5e'], ['12', 'SWEET BOSS', '#cf747d'], ['14', 'CHILL BOSS', '#9f4f55'], ['24', 'TRENDY NOTE', '#b15d68']]),
        stock: 0,
        sold: 88,
        isFeatured: false,
    },
    {
        categorySlug: 'bbia',
        name: 'BBIA Last Velvet Lip Tint',
        description: 'D?ng velvet tint n?i ti?ng c?a BBIA v?i ch?t son m?m m?n v? b?n m?u.',
        price: 189000,
        originalPrice: 249000,
        images: img('bbia/Last Velvet Lip Tint', ['2.webp', '12.webp', '14.webp', '23.webp', '35.webp']),
        shades: shades([['02', 'EXTRA BOUNCE', '#c96f72'], ['12', 'SWEET BOSS', '#cf747d'], ['14', 'CHILL BOSS', '#9f4f55'], ['23', 'ROMANTIC NOTE', '#b55369'], ['35', 'FEIGN JOY', '#bc6a75']]),
        stock: 45,
        sold: 267,
        isFeatured: true,
    },
    {
        categorySlug: 'intoyou',
        name: 'Into You Customized Airy Lip Mud',
        description: 'Son b?n airy si?u nh? m?i, t?o hi?u ?ng matte m?n v? th?i th??ng.',
        price: 145000,
        originalPrice: 185000,
        images: img('intoyou/Customized Airy Lip Mud', ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg']),
        shades: shades([['N1', 'N1', '#b5685e'], ['N2', 'N2', '#c17768'], ['N3', 'N3', '#a95652'], ['C1', 'C1', '#d06b5b'], ['C3', 'C3', '#c05053'], ['W4', 'W4', '#9f4244'], ['W5', 'W5', '#8e343b']]),
        stock: 72,
        sold: 203,
        isFeatured: true,
    },
    {
        categorySlug: 'intoyou',
        name: 'Into You SHERO Super Matte Lip',
        description: 'Ch?t son matte l? chu?n s?c, t?n m?i n?i b?t v? c? t?nh.',
        price: 139000,
        images: img('intoyou/SHERO Super Matte Lip', ['1.webp', '2.webp', '3.jpg', '4.jpg']),
        shades: shades([['EM01', 'EM01', '#b8484e'], ['EM19', 'EM19', '#8f3038'], ['EM04', 'EM04', '#c35a52'], ['EM17', 'EM17', '#9d3439']]),
        stock: 65,
        sold: 156,
        isFeatured: false,
    },
    {
        categorySlug: 'merzy',
        name: 'Merzy Bite The Beat Mellow Tint',
        description: 'Tint mellow am sac, len mau ro va giu moi mem trong nhieu gio.',
        price: 185000,
        originalPrice: 225000,
        images: img('merzy/Bite The Beat Mellow Tint', ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg']),
        shades: shades([['01', 'LEATHER BOOKMARK', '#9f5243'], ['02', 'METALLIC MAUVE', '#a75c70'], ['03', 'JANE CHILI', '#b13a35'], ['04', 'MOCHA LATTE', '#9a5b4d'], ['05', 'VAPOR RED', '#ba3f45']]),
        stock: 39,
        sold: 104,
        isFeatured: false,
    },
    {
        categorySlug: 'merzy',
        name: 'Merzy Cyber Mellow Tint',
        description: 'Son tint cyber mellow voi cac tone thoi thuong, sac net va ca tinh.',
        price: 189000,
        images: img('merzy/Cyber Mellow Tint', ['1.png', '2.png', '3.png', '4.png', '5.png']),
        shades: shades([['01', 'HIDDEN SECTION', '#98584f'], ['02', 'METALLIC MAUVE', '#a75c70'], ['03', 'TEMPTING RED', '#ad2f36'], ['04', 'NARATIVE ROSE', '#b65f70'], ['05', 'BRICK EMOTION', '#9d4437']]),
        stock: 37,
        sold: 92,
        isFeatured: false,
    },
    {
        categorySlug: 'merzy',
        name: 'Merzy New Watery Dew Tint',
        description: 'Tint b?ng m?ng n??c v?i ?? b?m m?u t?t, mang l?i ??i m?i c?ng tr?n s?c s?ng.',
        price: 189000,
        images: img('merzy/New Watery Dew Tint', ['20.png', '21.png', '22.png', '23.png', '27.png', '28.png', '29.png', '30.png']),
        shades: shades([['20', 'MISTY WOOD', '#8e5a50'], ['21', 'BURNT MAPLE', '#9c4439'], ['22', 'HAZEL CHILI', '#a63d34'], ['23', 'ANTIQUE FLAME', '#b5453a'], ['27', 'FIG DUSTY', '#9f5967'], ['28', 'WHISPER ODDY', '#b46b78'], ['29', 'FRESH BLOOM', '#ca7079'], ['30', 'BLISS DAWN', '#d38375']]),
        stock: 42,
        sold: 112,
        isFeatured: false,
    },
    {
        categorySlug: 'merzy',
        name: 'Merzy The First Velvet Tint',
        description: 'Velvet tint co dien cua Merzy voi lop finish li min va mau dam cuon hut.',
        price: 179000,
        originalPrice: 219000,
        images: img('merzy/The First Velvet Tint', ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg']),
        shades: shades([['01', 'ADDICTION', '#a83c43'], ['02', 'SAVAGE', '#8e2f34'], ['03', 'UNKNOWN', '#b1534c'], ['04', 'LOVE SICK', '#bc5364'], ['05', 'DEVOTION', '#7f2a33']]),
        stock: 41,
        sold: 132,
        isFeatured: true,
    },
    {
        categorySlug: 'merzy',
        name: 'Merzy Water Fit Blur Tint',
        description: 'Blur tint m?m m?i v?i finish l? m?n, nh? m?i v? d? t?n.',
        price: 195000,
        originalPrice: 235000,
        images: img('merzy/Water Fit Blur Tint', ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg']),
        shades: shades([['01', 'MONO BOUQUET', '#b96d72'], ['02', 'FLUFFY BEIGE', '#c88973'], ['03', 'NUDY PERSONA', '#bd7469'], ['04', 'ROSY GAZE', '#b75d6a'], ['05', 'MAUVE BURN', '#9d4c5c']]),
        stock: 38,
        sold: 95,
        isFeatured: true,
    },
    {
        categorySlug: 'romand',
        name: 'Romand The Juicy Lasting Tint',
        description: 'D?ng tint n?i ti?ng v?i hi?u ?ng juicy c?ng m?ng v? ?? b?n m?u cao.',
        price: 175000,
        originalPrice: 210000,
        images: img('romand/The Juicy Lasting Tint', ['1.webp', '2.webp', '3.webp', '4.webp', '5.webp', '6.webp', '7.webp', '8.webp', '9.webp', '10.webp']),
        shades: shades([['01', 'BARE GRAPE', '#b77b86'], ['02', 'POMELO SKIN', '#d38a72'], ['03', 'NUCADAMIA', '#bc7767'], ['04', 'FIG FIG', '#a64d64'], ['05', 'JUJUBE', '#b44f4a'], ['06', 'PEELING ANGDOO', '#cf5e69'], ['07', 'CHERRY BOMB', '#b82033'], ['08', 'PINK PUMPKIN', '#d17768'], ['09', 'MULLED PEACH', '#cf816c'], ['10', 'BARE APRICOT', '#dd8c67']]),
        stock: 48,
        sold: 256,
        isFeatured: true,
    },
    {
        categorySlug: 'romand',
        name: 'Romand Juicy Flash Lip Oil',
        description: 'Lip oil bong mong, cho moi trong treo voi sac mau nhe va do duong cao.',
        price: 169000,
        images: img('romand/Juicy Flash Lip Oil', ['1.webp', '2.webp', '3.webp', '4.webp', '5.webp']),
        shades: shades([['01', 'GRAPE FIG', '#9f5b70'], ['02', 'POMELO LIGHT', '#dc9375'], ['03', 'BERRY UP', '#c54867'], ['04', 'PEACH STROBE', '#e28c6f'], ['05', 'RASPBERRY SYRUP', '#b93655']]),
        stock: 52,
        sold: 147,
        isFeatured: false,
    },
    {
        categorySlug: 'romand',
        name: 'Romand Glasting Water Tint',
        description: 'Tint b?ng n??c v?i l?p m?u trong, c?ng m?i v? ?nh glasting ??c tr?ng.',
        price: 175000,
        originalPrice: 215000,
        images: img('romand/Glasting Water Tint', ['1.webp', '2.webp', '3.webp', '4.webp']),
        shades: shades([['01', 'MAUVE MOON', '#ad6a78'], ['02', 'NUDY SUNDOWN', '#c98572'], ['03', 'FIGRISE', '#a74f65'], ['04', 'WOODY SUNSET', '#9b5b4c']]),
        stock: 47,
        sold: 189,
        isFeatured: false,
    },
    {
        categorySlug: 'romand',
        name: 'Romand Glasting Color Gloss',
        description: 'Gloss m?u trong veo, t?o hi?u ?ng c?ng b?ng v? s?c m?i t??i t?n.',
        price: 179000,
        images: img('romand/Glasting Color Gloss', ['1.webp', '2.webp', '3.webp', '4.webp', '5.webp']),
        shades: shades([['01', 'PEONY BALLET', '#d28a9a'], ['02', 'NUTTY VAGUE', '#b98270'], ['03', 'ROSE FINCH', '#c66b78'], ['04', 'GRAPY WAY', '#a06378'], ['05', 'DIM MAUVE', '#9b6272']]),
        stock: 44,
        sold: 163,
        isFeatured: false,
    },
    {
        categorySlug: 'romand',
        name: 'Romand Dewyful Water Tint',
        description: 'Water tint c?ng b?ng t? nhi?n v?i m?u s?c trong tr?o, tr? trung.',
        price: 165000,
        images: img('romand/Dewyful Water Tint', ['1.webp', '2.webp', '3.webp', '4.webp', '5.webp']),
        shades: shades([['01', 'IN CORAL', '#d26b5b'], ['02', 'SALTY PEACH', '#df8b72'], ['03', 'IF ROSE', '#c76f7c'], ['04', 'CHERRY WAY', '#bd3945'], ['05', 'CUSTARD MAUVE', '#b87883']]),
        stock: 55,
        sold: 428,
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
