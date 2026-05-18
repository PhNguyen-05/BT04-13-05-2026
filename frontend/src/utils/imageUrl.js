const FALLBACK_IMG =
    'https://images.unsplash.com/photo-1586495778270-3263b471a0db?w=600&q=80';

/** Đường dẫn cũ (DB chưa seed lại) → thư mục mới trong frontend/public */
const LEGACY_PATH_ALIASES = {
    '/3ce/bia.jpg': '/3ce/Blur Water Tint/bia.jpg',
    '/3ce/bìa.jpg': '/3ce/Blur Water Tint/bia.jpg',
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
    '/romand/bia.jpg': '/romand/The Juicy Lasting Tint/bia.jpg',
    '/romand/bìa.jpg': '/romand/The Juicy Lasting Tint/bia.jpg',
    '/intoyou/bia.jpg': '/intoyou/Customized Airy Lip Mud/bia.jpg',
    '/intoyou/bìa.jpg': '/intoyou/Customized Airy Lip Mud/bia.jpg',
    '/merzy/bia.jpg': '/merzy/New Watery Dew Tint/bia.jpg',
    '/bbia/bia.jpg': '/bbia/Last Velvet Lip Tint/bia.jpg',
};

/** Gợi ý ảnh theo tên sản phẩm (khi DB còn tên cũ) */
const PRODUCT_NAME_COVERS = [
    { match: /3ce.*blur water/i, path: '/3ce/Blur Water Tint/bia.jpg' },
    { match: /3ce.*velvet/i, path: '/3ce/Velvet Lip Tint Plush/bia.jpg' },
    { match: /3ce.*soft lip|3ce.*glaze/i, path: '/3ce/Blur Water Tint/bia.jpg' },
    { match: /bbia.*glow/i, path: '/bbia/Glow Tint Edition/bia.jpg' },
    { match: /bbia.*velvet/i, path: '/bbia/Last Velvet Lip Tint/bia.jpg' },
    { match: /into you.*airy|into you.*mud/i, path: '/intoyou/Customized Airy Lip Mud/bia.jpg' },
    { match: /into you.*shero/i, path: '/intoyou/SHERO Super Matte Lip/1.webp' },
    { match: /merzy.*watery dew|merzy.*new watery/i, path: '/merzy/New Watery Dew Tint/bia.jpg' },
    { match: /merzy.*water fit|merzy.*blur/i, path: '/merzy/Water Fit Blur Tint/bia.jpg' },
    { match: /romand.*dewyful/i, path: '/romand/Dewyful Water Tint/bia.webp' },
    { match: /romand.*juicy/i, path: '/romand/The Juicy Lasting Tint/bia.jpg' },
];

function decodePath(path) {
    let normalized = path.trim();
    try {
        let prev = null;
        while (prev !== normalized && /%[0-9A-Fa-f]{2}/.test(normalized)) {
            prev = normalized;
            normalized = decodeURIComponent(normalized);
        }
    } catch {
        /* ignore */
    }
    return normalized;
}

function applyLegacyAlias(path) {
    const decoded = decodePath(path);
    if (LEGACY_PATH_ALIASES[decoded]) return LEGACY_PATH_ALIASES[decoded];
    if (LEGACY_PATH_ALIASES[path]) return LEGACY_PATH_ALIASES[path];

    // /3ce/5.jpg → flat file cũ
    const flat = decoded.match(/^\/(3ce|romand|intoyou|merzy|bbia)\/([^/]+)\.(jpg|webp|png)$/i);
    if (flat && LEGACY_PATH_ALIASES[decoded]) {
        return LEGACY_PATH_ALIASES[decoded];
    }

    return decoded;
}

/**
 * Chuẩn hóa đường dẫn ảnh tĩnh (frontend/public).
 */
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

/** Danh sách URL thử lần lượt khi ảnh lỗi (ưu tiên ảnh bìa) */
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
