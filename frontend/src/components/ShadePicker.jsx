import { useState, useEffect } from 'react';
import { resolveImageUrl, FALLBACK_IMG } from '../utils/imageUrl';

const ShadeThumb = ({ src, alt }) => {
    const [imgSrc, setImgSrc] = useState(() => resolveImageUrl(src));

    useEffect(() => {
        setImgSrc(resolveImageUrl(src));
    }, [src]);

    const handleError = () => {
        if (imgSrc.endsWith('.jpg')) {
            setImgSrc(imgSrc.replace(/\.jpg$/i, '.webp'));
        } else if (imgSrc.endsWith('.png')) {
            setImgSrc(imgSrc.replace(/\.png$/i, '.jpg'));
        } else {
            setImgSrc(FALLBACK_IMG);
        }
    };

    return (
        <img
            src={imgSrc}
            alt={alt}
            onError={handleError}
            className="aura-shade-item-img"
        />
    );
};

const ShadePicker = ({ items, selectedId, onSelect, onAddToCart, onBuyNow, loadingKey }) => {
    if (!items?.length) return null;

    const hasActions = Boolean(onAddToCart || onBuyNow);

    return (
        <div className="aura-shade-picker" role="listbox" aria-label="Chọn màu son">
            {items.map((item) => {
                const active = item.id === selectedId;
                const outOfStock = item.stock <= 0;
                const isLoading = loadingKey === item.id;

                return (
                    <div
                        key={item.id}
                        role="option"
                        aria-selected={active}
                        className={`aura-shade-item${active ? ' active' : ''}${outOfStock ? ' out-of-stock' : ''}`}
                    >
                        <button
                            type="button"
                            className="aura-shade-item-select"
                            onClick={() => onSelect(item.id)}
                            title={item.name || item.label}
                        >
                            <div className="aura-shade-item-visual">
                                <ShadeThumb src={item.image} alt={item.label} />
                            </div>
                            <span className="aura-shade-item-copy">
                                <span className="aura-shade-item-name">
                                    {item.swatch && <span className="aura-shade-swatch-chip" style={{ background: item.swatch }} />}
                                    <span>{item.label}</span>
                                </span>
                                {item.description && <span className="aura-shade-item-desc">{item.description}</span>}
                            </span>
                            {outOfStock && <span className="aura-shade-soldout">Hết hàng</span>}
                        </button>

                        {hasActions && (
                            <div className="aura-shade-item-actions">
                                <button
                                    type="button"
                                    className="aura-shade-action-btn"
                                    onClick={() => onAddToCart?.(item)}
                                    disabled={outOfStock || isLoading}
                                    title="Thêm màu này vào giỏ"
                                    aria-label="Thêm màu này vào giỏ"
                                >
                                    <i className="bi bi-bag-plus" />
                                </button>
                                <button
                                    type="button"
                                    className="aura-shade-action-btn buy"
                                    onClick={() => onBuyNow?.(item)}
                                    disabled={outOfStock || isLoading}
                                    title="Mua ngay màu này"
                                >
                                    {isLoading ? 'Đang xử lý...' : 'Mua màu này'}
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ShadePicker;
