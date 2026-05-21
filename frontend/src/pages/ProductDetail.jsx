import { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import api from '../services/api.service';
import ProductCard from '../components/ProductCard';
import ShadePicker from '../components/ShadePicker';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { resolveImageList } from '../utils/imageUrl';

const LINE_SHADE_COPY = {
    '3ce-velvet-lip-tint-plush': [
        {
            shadeCode: '01',
            shadeName: 'Speak Up',
            colorFamily: 'Đỏ Rượu',
            swatch: '#8f2532',
            description: 'Sắc đỏ rượu vang đầy quyến rũ và vô cùng tôn da. Đây là tông màu mang lại vẻ đẹp sang trọng, quyền lực, giúp làm bừng sáng khuôn mặt và cực kỳ phù hợp cho những buổi tiệc hay sự kiện.',
        },
        {
            shadeCode: '02',
            shadeName: 'Taupe',
            colorFamily: 'Nâu Đỏ',
            swatch: '#9a4b3e',
            description: 'Tông nâu đỏ trầm ấm, cá tính và luôn dẫn đầu xu hướng. Màu son này không hề kén tông da, mang đến phong cách tây hiện đại và dễ dàng kết hợp với nhiều layout trang điểm khác nhau.',
        },
        {
            shadeCode: '07',
            shadeName: 'Dusky Pink',
            colorFamily: 'Hồng Đậu',
            swatch: '#c37a83',
            description: 'Sắc hồng đậu êm dịu, ngọt ngào và thanh lịch. Lựa chọn hoàn hảo cho phong cách trang điểm tự nhiên, trong trẻo, rất phù hợp để sử dụng hàng ngày khi đi học hay đi làm.',
        },
        {
            shadeCode: '08',
            shadeName: 'Figtachio',
            colorFamily: 'Mơ Khô',
            swatch: '#c77a61',
            description: 'Tông màu mơ khô nhã nhặn, pha trộn sự tươi tắn và chút trầm tĩnh. Màu son mang lại vẻ ngoài ấm áp, trẻ trung, rạng rỡ nhưng không bị chói.',
        },
        {
            shadeCode: '23',
            shadeName: 'Darkest Hour',
            colorFamily: 'Đỏ Rượu Rum',
            swatch: '#5b1822',
            description: 'Sắc đỏ rượu rum đậm đà, huyền bí và đầy ma mị. Một tông màu hoàn hảo cho những cô nàng theo đuổi phong cách sắc sảo, gợi cảm và muốn tạo điểm nhấn thu hút mọi ánh nhìn.',
        },
    ],
};

const GENERIC_SHADE_SWATCHES = ['#b64552', '#9f5645', '#c7797d', '#d28a67', '#6f2430', '#d45e51', '#b96a8a', '#a84b3c', '#d9a084', '#8d3347'];

const getShadeLabel = (name, index) => {
    const match = name?.match(/(\d+)\s*$/);
    return match ? match[1].padStart(2, '0') : String(index + 1).padStart(2, '0');
};

const getShadeCopy = (product, index) => {
    if (product?.shadeName) {
        return {
            shadeCode: product.shadeCode || getShadeLabel(product.name, index),
            shadeName: product.shadeName,
            colorFamily: '',
            swatch: product.colors?.[0] || GENERIC_SHADE_SWATCHES[index % GENERIC_SHADE_SWATCHES.length],
            description: product.description || 'Tone son dễ dùng, lên màu hài hòa và phù hợp để phối cùng nhiều phong cách trang điểm hằng ngày.',
        };
    }

    const custom = product?.lineSlug ? LINE_SHADE_COPY[product.lineSlug]?.[index] : null;
    if (custom) return custom;

    const shadeCode = product?.shadeCode || getShadeLabel(product?.name, index);
    const shadeName = product?.shadeName || `Tone ${shadeCode}`;

    return {
        shadeCode,
        shadeName,
        colorFamily: '',
        swatch: GENERIC_SHADE_SWATCHES[index % GENERIC_SHADE_SWATCHES.length],
        description: product?.description || 'Tone son dễ dùng, lên màu hài hòa và phù hợp để phối cùng nhiều phong cách trang điểm hằng ngày.',
    };
};

const getShadeDisplayName = (product, index) => {
    const shade = getShadeCopy(product, index);
    return `Màu ${shade.shadeCode} - ${shade.shadeName}${shade.colorFamily ? ` (${shade.colorFamily})` : ''}`;
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);

    const [lineProducts, setLineProducts] = useState([]);
    const [activeProduct, setActiveProduct] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [actionLoadingKey, setActionLoadingKey] = useState(null);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [selectedVariantId, setSelectedVariantId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, lineRes, similarRes] = await Promise.all([
                    api.get(`/products/${id}`),
                    api.get(`/products/${id}/line`),
                    api.get(`/products/${id}/similar`),
                ]);

                const product = productRes.data;
                const line = lineRes.data?.length ? lineRes.data : [product];
                const current = line.find((p) => p._id === id) || product;

                setLineProducts(line);
                setActiveProduct(current);
                setSimilar(similarRes.data || []);
                setSelectedVariantId(current.variants?.length ? current.variants[0]._id : null);
                setQuantity(1);
                setThumbsSwiper(null);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [id]);

    const selectedVariant = useMemo(
        () => activeProduct?.variants?.find((v) => v._id === selectedVariantId) || null,
        [activeProduct, selectedVariantId]
    );

    const displayProduct = selectedVariant || activeProduct;

    const selectedProductIndex = useMemo(
        () => Math.max(0, lineProducts.findIndex((product) => product._id === activeProduct?._id)),
        [activeProduct, lineProducts]
    );


    const pickerItems = useMemo(() => {
        if (!activeProduct) return [];

        if (activeProduct.variants?.length) {
            return activeProduct.variants.map((variant, index) => ({
                id: variant._id,
                label: variant.colorName || variant.color || `Màu ${String(index + 1).padStart(2, '0')}`,
                image: variant.images?.[0] || activeProduct.images?.[0],
                name: variant.colorName || variant.color,
                stock: variant.stock ?? 0,
                productId: activeProduct._id,
                variantId: variant._id,
                type: 'variant',
            }));
        }

        return lineProducts.map((product, index) => {
            const shade = getShadeCopy(product, index);

            return {
                id: product._id,
                label: getShadeDisplayName(product, index),
                image: product.images?.[0],
                name: getShadeDisplayName(product, index),
                description: shade.description,
                swatch: shade.swatch,
                stock: product.stock ?? 0,
                productId: product._id,
                variantId: null,
                type: 'product',
            };
        });
    }, [activeProduct, lineProducts]);

    const selectedPickerId = activeProduct?.variants?.length ? selectedVariantId : activeProduct?._id;

    const slideItems = useMemo(() => {
        if (!activeProduct) return [];

        if (activeProduct.variants?.length) {
            return activeProduct.variants.map((variant, index) => ({
                id: variant._id,
                image: resolveImageList(variant.images?.length ? variant.images : activeProduct.images)[0],
                title: variant.colorName || variant.color || `Màu ${String(index + 1).padStart(2, '0')}`,
                description: variant.description || activeProduct.description,
                productId: activeProduct._id,
                variantId: variant._id,
                stock: variant.stock ?? 0,
            }));
        }

        return lineProducts.map((product, index) => ({
            id: product._id,
            image: resolveImageList(product.images)[0],
            title: getShadeDisplayName(product, index),
            description: getShadeCopy(product, index).description,
            productId: product._id,
            variantId: null,
            stock: product.stock ?? 0,
        }));
    }, [activeProduct, lineProducts]);

    const images = useMemo(() => slideItems.map((item) => item.image).filter(Boolean), [slideItems]);
    const stock = selectedVariant?.stock ?? activeProduct?.stock ?? 0;

    const selectedCartItem = useMemo(() => ({
        id: selectedPickerId || activeProduct?._id,
        productId: activeProduct?._id,
        variantId: selectedVariantId || null,
        stock,
    }), [activeProduct, selectedPickerId, selectedVariantId, stock]);

    const handlePickerSelect = useCallback(
        (pickerId) => {
            if (activeProduct?.variants?.length) {
                setSelectedVariantId(pickerId);
                setQuantity(1);
                setThumbsSwiper(null);
                return;
            }

            const next = lineProducts.find((product) => product._id === pickerId);
            if (!next) return;

            setActiveProduct(next);
            setSelectedVariantId(null);
            setQuantity(1);
            setThumbsSwiper(null);
            navigate(`/product/${next._id}`, { replace: true });
        },
        [activeProduct, lineProducts, navigate]
    );

    const handleSlideChange = useCallback((swiper) => {
        const nextSlide = slideItems[swiper.realIndex];
        if (!nextSlide || nextSlide.id === selectedPickerId) return;
        handlePickerSelect(nextSlide.id);
    }, [handlePickerSelect, selectedPickerId, slideItems]);

    const handleCartAction = async (item = selectedCartItem, buyNow = false) => {
        if (!user) {
            alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate('/login');
            return;
        }
        if (!item?.productId || item.stock <= 0) {
            alert('Sản phẩm đã hết hàng!');
            return;
        }

        const orderQuantity = Math.min(quantity, item.stock);
        setLoading(true);
        setActionLoadingKey(item.id);
        const success = await addToCart(item.productId, orderQuantity, item.variantId || null);
        setLoading(false);
        setActionLoadingKey(null);

        if (success && buyNow) {
            navigate('/checkout');
            return;
        }
        if (success) {
            alert(`Đã thêm ${orderQuantity} sản phẩm vào giỏ hàng!`);
        }
    };

    if (!activeProduct || !displayProduct) {
        return (
            <Container className="py-5 text-center">
                <p>Đang tải thông tin sản phẩm...</p>
            </Container>
        );
    }

    const showShadePicker = pickerItems.length > 1;
    const discountPercent = activeProduct.originalPrice
        ? Math.round(100 - ((activeProduct.price || 0) / activeProduct.originalPrice) * 100)
        : 0;

    return (
        <Container className="py-4 product-detail-page">
            <Button as={Link} to="/shop" variant="link" className="link-aura mb-3 p-0 product-detail-back">
                <i className="bi bi-arrow-left me-1" />
                Quay lại cửa hàng
            </Button>

            <section className="product-detail-shell">
                <Row className="g-0">
                    <Col lg={5} className="product-detail-media">
                        <Swiper
                            key={`main-${activeProduct.lineSlug || activeProduct._id}-${selectedPickerId || 'line'}`}
                            modules={[Navigation, Pagination, Autoplay, Thumbs]}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={images.length > 1 ? { delay: 5000 } : false}
                            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                            onSlideChange={handleSlideChange}
                            initialSlide={activeProduct.variants?.length ? Math.max(0, pickerItems.findIndex((item) => item.id === selectedVariantId)) : selectedProductIndex}
                            className="product-main-swiper"
                        >
                            {slideItems.map((item, index) => (
                                <SwiperSlide key={`${item.id}-${index}`}>
                                    <img src={item.image} alt={item.title || activeProduct.name} className="product-detail-main-img" />
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {images.length > 1 && (
                            <Swiper
                                key={`thumbs-${activeProduct.lineSlug || activeProduct._id}-${selectedPickerId || 'line'}`}
                                onSwiper={setThumbsSwiper}
                                spaceBetween={10}
                                slidesPerView={Math.min(5, images.length)}
                                freeMode
                                watchSlidesProgress
                                className="product-thumb-swiper"
                            >
                                {slideItems.map((item, index) => (
                                    <SwiperSlide key={`thumb-${item.id}-${index}`}>
                                        <img src={item.image} alt={item.title} className="product-detail-thumb-img" />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}

                        <div className="product-share-row">
                            <span>Chia sẻ:</span>
                            <span className="share-dot">f</span>
                            <span className="share-dot">p</span>
                            <span className="share-dot dark">x</span>
                            <span className="product-liked">
                                <i className="bi bi-heart" />
                                Đã thích ({activeProduct.sold || 0})
                            </span>
                        </div>
                    </Col>

                    <Col lg={7} className="product-detail-info">
                        <div className="product-title-row">
                            <span className="product-favorite-badge">Aura Pick</span>
                            <h1>{activeProduct.lineName || activeProduct.name}</h1>
                        </div>


                        <div className="product-meta-row">
                            <span className="rating-score">5.0</span>
                            <span className="rating-stars">★★★★★</span>
                            <span className="meta-divider" />
                            <span className="rating-score">{Math.max(1, Math.round((activeProduct.views || 8) / 8))}</span>
                            <span className="text-muted">Đánh giá</span>
                            <span className="meta-spacer" />
                            <span className="product-report-btn">Chính hãng</span>
                        </div>

                        <div className="product-price-panel">
                            <span className="product-price">{(activeProduct.price ?? 0).toLocaleString('vi-VN')}đ</span>
                            {activeProduct.originalPrice && (
                                <>
                                    <span className="product-original-price">
                                        {activeProduct.originalPrice.toLocaleString('vi-VN')}đ
                                    </span>
                                    <span className="product-discount">-{discountPercent}%</span>
                                </>
                            )}
                        </div>

                        <div className="product-service-list">
                            <div className="detail-option-row">
                                <div className="detail-option-label">Vận chuyển</div>
                                <div className="detail-option-content">
                                    <i className="bi bi-truck me-2" />
                                    {stock > 0 ? 'Sẵn hàng, giao nhanh nội thành' : 'Tạm hết hàng'}
                                </div>
                            </div>
                            <div className="detail-option-row">
                                <div className="detail-option-label">Cam kết</div>
                                <div className="detail-option-content">
                                    <i className="bi bi-shield-check me-2 text-aura" />
                                    Sản phẩm chính hãng, đổi trả trong 15 ngày nếu còn nguyên tem
                                </div>
                            </div>
                        </div>

                        {showShadePicker && (
                            <div className="detail-option-row product-color-row">
                                <div className="detail-option-label">Bảng màu</div>
                                <div className="detail-option-content">
                                    <ShadePicker
                                        items={pickerItems}
                                        selectedId={selectedPickerId}
                                        onSelect={handlePickerSelect}
                                        onAddToCart={(item) => handleCartAction(item, false)}
                                        onBuyNow={(item) => handleCartAction(item, true)}
                                        loadingKey={actionLoadingKey}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="detail-option-row product-quantity-row">
                            <div className="detail-option-label">Số lượng</div>
                            <div className="detail-option-content d-flex align-items-center gap-3">
                                <div className="d-inline-flex align-items-center aura-shade-qty">
                                    <button
                                        type="button"
                                        className="aura-shade-qty-btn"
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        disabled={quantity <= 1}
                                        aria-label="Giảm số lượng"
                                    >
                                        -
                                    </button>
                                    <span className="aura-shade-qty-value">{quantity}</span>
                                    <button
                                        type="button"
                                        className="aura-shade-qty-btn"
                                        onClick={() => setQuantity((q) => Math.min(q + 1, stock))}
                                        disabled={quantity >= stock || stock <= 0}
                                        aria-label="Tăng số lượng"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className={`product-stock-note ${stock > 0 ? '' : 'soldout'}`}>
                                    {stock > 0 ? `${stock} sản phẩm có sẵn` : 'Hết hàng'}
                                </span>
                            </div>
                        </div>

                        <div className="product-action-row">
                            <Button
                                className="product-add-cart-btn"
                                onClick={() => handleCartAction(selectedCartItem, false)}
                                disabled={loading || stock <= 0}
                            >
                                <i className="bi bi-cart-plus me-2" />
                                {loading ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                            </Button>
                            <Button
                                className="product-buy-now-btn"
                                onClick={() => handleCartAction(selectedCartItem, true)}
                                disabled={loading || stock <= 0}
                            >
                                Mua ngay màu này
                            </Button>
                        </div>
                    </Col>
                </Row>
            </section>

            <section className="product-description-panel">
                <h5>Mô tả chi tiết</h5>
                <p>{activeProduct.description || 'Son môi cao cấp Aura Lips, màu chuẩn, bền màu và dưỡng môi.'}</p>
            </section>

            {similar.length > 0 && (
                <section className="mt-5 pt-4">
                    <h3 className="font-display mb-4">Sản phẩm tương tự</h3>
                    <Row className="g-4">
                        {similar.map((product) => (
                            <Col key={product._id} sm={6} lg={3}>
                                <ProductCard product={product} />
                            </Col>
                        ))}
                    </Row>
                </section>
            )}
        </Container>
    );
};

export default ProductDetail;
