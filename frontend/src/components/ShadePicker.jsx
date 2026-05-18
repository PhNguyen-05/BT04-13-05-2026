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

/**
 * @param {{ id: string, label: string, image: string, name?: string }[]} items
 * @param {string} selectedId
 * @param {(id: string) => void} onSelect
 */
const ShadePicker = ({ items, selectedId, onSelect }) => {
    if (!items?.length) return null;

    return (
        <div className="aura-shade-picker" role="listbox" aria-label="Chọn màu">
            {items.map((item) => {
                const active = item.id === selectedId;
                return (
                    <button
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`aura-shade-item${active ? ' active' : ''}`}
                        onClick={() => onSelect(item.id)}
                        title={item.name || item.label}
                    >
                        <div className="aura-shade-item-visual">
                            <ShadeThumb src={item.image} alt={item.label} />
                        </div>
                        <span className="aura-shade-item-no">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default ShadePicker;
