const FALLBACK_IMG =
    'https://images.unsplash.com/photo-1586495778270-3263b471a0db?w=600&q=80';

const BRAND_COVERS = {
    '3ce': '/3ce/bia.jpg',
    romand: '/romand/bia.jpg',
    intoyou: '/intoyou/bia.png',
    merzy: '/merzy/bia.png',
    bbia: '/bbia/bia.jpg',
};

const LEGACY_PATH_ALIASES = {
    '/3ce/bia.jpg': BRAND_COVERS['3ce'],
    '/3ce/bia2.jpg': BRAND_COVERS['3ce'],
    '/3ce/bia.png': BRAND_COVERS['3ce'],
    '/3ce/Blur Water Tint/bia.jpg': BRAND_COVERS['3ce'],
    '/3ce/Velvet Lip Tint Plush/bia.jpg': BRAND_COVERS['3ce'],
    '/3ce/1.jpg': '/3ce/Velvet Lip Tint Plush/1.webp',
    '/3ce/2.jpg': '/3ce/Velvet Lip Tint Plush/2.webp',
    '/3ce/3.jpg': '/3ce/Blur Water Tint/3.jpg',
    '/3ce/4.jpg': '/3ce/Blur Water Tint/4.webp',
    '/3ce/4.webp': '/3ce/Blur Water Tint/4.webp',
    '/3ce/5.jpg': '/3ce/Blur Water Tint/5.jpg',
    '/3ce/6.jpg': '/3ce/Blur Water Tint/6.jpg',
    '/3ce/7.jpg': '/3ce/Blur Water Tint/7.jpg',
    '/3ce/8.jpg': '/3ce/Blur Water Tint/8.webp',
    '/3ce/8.webp': '/3ce/Blur Water Tint/8.webp',
    '/3ce/9.jpg': '/3ce/Blur Water Tint/9.jpg',
    '/3ce/10.jpg': '/3ce/Blur Water Tint/10.jpg',
    '/romand/bia.jpg': BRAND_COVERS.romand,
    '/romand/bia2.jpg': BRAND_COVERS.romand,
    '/romand/bia.png': BRAND_COVERS.romand,
    '/romand/Dewyful Water Tint/bia.webp': BRAND_COVERS.romand,
    '/romand/Dewyful Water Tint/bia.jpg': BRAND_COVERS.romand,
    '/romand/The Juicy Lasting Tint/bia.jpg': BRAND_COVERS.romand,
    '/romand/Dewyful Water Tint/1.jpg': '/romand/Dewyful Water Tint/1.webp',
    '/romand/Dewyful Water Tint/2.jpg': '/romand/Dewyful Water Tint/2.webp',
    '/romand/Dewyful Water Tint/3.jpg': '/romand/Dewyful Water Tint/3.webp',
    '/romand/Dewyful Water Tint/4.jpg': '/romand/Dewyful Water Tint/4.webp',
    '/romand/Dewyful Water Tint/5.jpg': '/romand/Dewyful Water Tint/5.webp',
    '/romand/The Juicy Lasting Tint/1.jpg': '/romand/The Juicy Lasting Tint/1.webp',
    '/romand/The Juicy Lasting Tint/2.jpg': '/romand/The Juicy Lasting Tint/2.webp',
    '/romand/The Juicy Lasting Tint/3.jpg': '/romand/The Juicy Lasting Tint/3.webp',
    '/romand/The Juicy Lasting Tint/4.jpg': '/romand/The Juicy Lasting Tint/4.webp',
    '/romand/The Juicy Lasting Tint/5.jpg': '/romand/The Juicy Lasting Tint/5.webp',
    '/romand/The Juicy Lasting Tint/6.jpg': '/romand/The Juicy Lasting Tint/6.webp',
    '/romand/The Juicy Lasting Tint/7.jpg': '/romand/The Juicy Lasting Tint/7.webp',
    '/romand/The Juicy Lasting Tint/8.jpg': '/romand/The Juicy Lasting Tint/8.webp',
    '/romand/The Juicy Lasting Tint/9.jpg': '/romand/The Juicy Lasting Tint/9.webp',
    '/romand/The Juicy Lasting Tint/10.jpg': '/romand/The Juicy Lasting Tint/10.webp',
    '/intoyou/bia.jpg': BRAND_COVERS.intoyou,
    '/intoyou/bia.png': BRAND_COVERS.intoyou,
    '/intoyou/Customized Airy Lip Mud/bia.jpg': BRAND_COVERS.intoyou,
    '/intoyou/SHERO Super Matte Lip/bia.jpg': BRAND_COVERS.intoyou,
    '/intoyou/SHERO Super Matte Lip/3.webp': '/intoyou/SHERO Super Matte Lip/3.jpg',
    '/intoyou/SHERO Super Matte Lip/4.webp': '/intoyou/SHERO Super Matte Lip/4.jpg',
    '/merzy/bia.jpg': BRAND_COVERS.merzy,
    '/merzy/bia.png': BRAND_COVERS.merzy,
    '/merzy/bia2.jpg': BRAND_COVERS.merzy,
    '/merzy/New Watery Dew Tint/bia.jpg': BRAND_COVERS.merzy,
    '/merzy/Water Fit Blur Tint/bia.jpg': BRAND_COVERS.merzy,
    '/bbia/bia.jpg': BRAND_COVERS.bbia,
    '/bbia/bia2.jpg': BRAND_COVERS.bbia,
    '/bbia/bia.png': BRAND_COVERS.bbia,
    '/bbia/Glow Tint Edition/bia.jpg': BRAND_COVERS.bbia,
    '/bbia/Last Velvet Lip Tint/bia.jpg': BRAND_COVERS.bbia,
};

const PRODUCT_NAME_COVERS = [
    { match: /3ce.*blur water/i, path: '/3ce/Blur Water Tint/1.jpg' },
    { match: /3ce.*velvet/i, path: '/3ce/Velvet Lip Tint Plush/1.webp' },
    { match: /3ce.*soft lip|3ce.*glaze/i, path: '/3ce/Blur Water Tint/1.jpg' },
    { match: /bbia.*glow/i, path: '/bbia/Glow Tint Edition/2.jpg' },
    { match: /bbia.*velvet/i, path: '/bbia/Last Velvet Lip Tint/2.webp' },
    { match: /into you.*airy|into you.*mud/i, path: '/intoyou/Customized Airy Lip Mud/1.jpg' },
    { match: /into you.*shero/i, path: '/intoyou/SHERO Super Matte Lip/1.webp' },
    { match: /merzy.*watery dew|merzy.*new watery/i, path: '/merzy/New Watery Dew Tint/20.png' },
    { match: /merzy.*water fit|merzy.*blur/i, path: '/merzy/Water Fit Blur Tint/1.jpg' },
    { match: /romand.*dewyful/i, path: '/romand/Dewyful Water Tint/1.webp' },
    { match: /romand.*juicy/i, path: '/romand/The Juicy Lasting Tint/1.webp' },
    { match: /romand.*flash.*oil/i, path: '/romand/Juicy Flash Lip Oil/1.webp' },
    { match: /romand.*glasting water/i, path: '/romand/Glasting Water Tint/1.webp' },
    { match: /romand.*glasting color/i, path: '/romand/Glasting Color Gloss/1.webp' },
];

function isCoverImage(path = '') {
    return /(^|\/)(bia|bìa|cover)\.(jpe?g|png|webp)$/i.test(decodePath(path));
}

function decodePath(path) {
    let normalized = path.trim();
    try {
        let prev = null;
        while (prev !== normalized && /%[0-9A-Fa-f]{2}/.test(normalized)) {
            prev = normalized;
            normalized = decodeURIComponent(normalized);
        }
    } catch {
        /* keep the original path */
    }
    return normalized;
}

function normalizeBiaName(path) {
    return path.replace(/\/b(?:i|%C3%AC|ì|Ã¬)a\.(jpg|jpeg|png|webp)$/i, '/bia.$1');
}

function applyLegacyAlias(path) {
    const decoded = normalizeBiaName(decodePath(path));
    if (LEGACY_PATH_ALIASES[decoded]) return LEGACY_PATH_ALIASES[decoded];

    return decoded;
}

export function resolveImageUrl(path, fallback = FALLBACK_IMG) {
    if (!path || typeof path !== 'string') return fallback;

    if (/^https?:\/\//i.test(path) || path.startsWith('data:')) {
        return path;
    }

    let normalized = applyLegacyAlias(path);

    if (!normalized.startsWith('/')) {
        normalized = `/${normalized}`;
    }

    return encodeURI(normalized);
}

export function resolveImageList(paths, fallback = FALLBACK_IMG) {
    if (!Array.isArray(paths) || !paths.length) return [fallback];
    return paths.map((p) => resolveImageUrl(p, fallback));
}

export function resolveProductImageList(paths, fallback = FALLBACK_IMG) {
    if (!Array.isArray(paths) || !paths.length) return [fallback];
    const productImages = paths.filter((p) => !isCoverImage(p));
    return (productImages.length ? productImages : paths).map((p) => resolveImageUrl(p, fallback));
}

export function getProductImageCandidates(product) {
    const urls = [];
    const seen = new Set();

    const add = (p) => {
        if (!p) return;
        const url = resolveImageUrl(p, null);
        if (url && !seen.has(url)) {
            seen.add(url);
            urls.push(url);
        }
    };

    const images = product?.images;
    if (Array.isArray(images) && images.length) {
        images.filter((f) => !isCoverImage(f)).forEach(add);
        const cover = images.find((f) => /bia|bìa|cover/i.test(f)) || images[0];
        add(cover);
        images.forEach(add);
    }

    if (product?.name) {
        for (const { match, path } of PRODUCT_NAME_COVERS) {
            if (match.test(product.name)) {
                add(path);
                break;
            }
        }
    }

    if (!urls.length) urls.push(FALLBACK_IMG);
    return urls;
}

export function getProductImage(product, fallback = FALLBACK_IMG) {
    return getProductImageCandidates(product)[0] || fallback;
}

export { FALLBACK_IMG };
