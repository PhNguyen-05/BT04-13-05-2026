import { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
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

const getShadeLabel = (name, index) => {
    const match = name?.match(/(\d+)\s*$/);
    return match ? match[1].padStart(2, '0') : String(index + 1).padStart(2, '0');
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
                const current =
                    line.find((p) => p._id === id) || product;

                setLineProducts(line);
                setActiveProduct(current);
                setSimilar(similarRes.data);

                if (current.variants?.length) {
                    setSelectedVariantId(current.variants[0]._id);
                } else {
                    setSelectedVariantId(null);
                }
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

    const pickerItems = useMemo(() => {
        if (!activeProduct) return [];

        if (activeProduct.variants?.length) {
            return activeProduct.variants.map((v, index) => ({
                id: v._id,
                label: getShadeLabel(v.colorName || v.color, index),
                image: v.images?.[0] || activeProduct.images?.[0],
                name: v.colorName || v.color,
                type: 'variant',
            }));
        }

        return lineProducts.map((p, index) => ({
            id: p._id,
            label: getShadeLabel(p.name, index),
            image: p.images?.[0],
            name: p.name,
            type: 'product',
        }));
    }, [activeProduct, lineProducts]);

    const selectedPickerId = useMemo(() => {
        if (activeProduct?.variants?.length) return selectedVariantId;
        return activeProduct?._id;
    }, [activeProduct, selectedVariantId]);

    const images = useMemo(() => {
        if (selectedVariant?.images?.length) {
            return resolveImageList(selectedVariant.images);
        }
        return resolveImageList(activeProduct?.images);
    }, [activeProduct, selectedVariant]);

    const stock = selectedVariant?.stock ?? activeProduct?.stock ?? 0;

    const handlePickerSelect = useCallback(
        (pickerId) => {
            if (activeProduct?.variants?.length) {
                setSelectedVariantId(pickerId);
                setQuantity(1);
                setThumbsSwiper(null);
                return;
            }

            const next = lineProducts.find((p) => p._id === pickerId);
            if (!next) return;

            setActiveProduct(next);
            setSelectedVariantId(null);
            setQuantity(1);
            setThumbsSwiper(null);
            window.history.replaceState(null, '', `/product/${next._id}`);
        },
        [activeProduct, lineProducts]
    );

    const handleAddToCart = async () => {
        if (!user) {
            alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate('/login');
            return;
        }
        if (stock <= 0) {
            alert('Sản phẩm đã hết hàng!');
            return;
        }

        setLoading(true);
        const success = await addToCart(
            activeProduct._id,
            quantity,
            selectedVariantId || null
        );
        if (success) {
            alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
        }
        setLoading(false);
    };

    if (!activeProduct) {
        return (
            <Container className="py-5 text-center">
                <p>Đang tải thông tin sản phẩm...</p>
            </Container>
        );
    }

    const showShadePicker = pickerItems.length > 1;

    return (
        <Container className="py-5">
            <Button as={Link} to="/shop" variant="link" className="link-aura mb-3 p-0">
                <i className="bi bi-arrow-left me-1" />
                Quay lại cửa hàng
            </Button>

            <Row className="g-5">
                <Col lg={6}>
                    <Swiper
                        key={`main-${activeProduct._id}-${selectedVariantId || 'default'}`}
                        modules={[Navigation, Pagination, Autoplay, Thumbs]}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={images.length > 1 ? { delay: 5000 } : false}
                        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                        className="rounded-4 overflow-hidden shadow-sm product-main-swiper"
                    >
                        {images.map((img, index) => (
                            <SwiperSlide key={`${img}-${index}`}>
                                <img
                                    src={img}
                                    alt={activeProduct.name}
                                    className="w-100 product-detail-main-img"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {images.length > 1 && (
                        <Swiper
                            key={`thumbs-${activeProduct._id}-${selectedVariantId || 'default'}`}
                            onSwiper={setThumbsSwiper}
                            spaceBetween={10}
                            slidesPerView={Math.min(4, images.length)}
                            freeMode
                            watchSlidesProgress
                            className="mt-3 product-thumb-swiper"
                        >
                            {images.map((img, index) => (
                                <SwiperSlide key={`thumb-${index}`}>
                                    <img
                                        src={img}
                                        alt=""
                                        className="rounded-3 w-100 border product-detail-thumb-img"
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </Col>

                <Col lg={6}>
                    <Badge className="mb-2 rounded-pill" style={{ background: 'var(--lavender)' }}>
                        Danh mục: {activeProduct.category?.name || 'Chưa phân loại'}
                    </Badge>

                    <h1 className="font-display fw-bold mb-3">{activeProduct.name}</h1>

                    <div className="d-flex align-items-baseline gap-3 mb-3">
                        <h3 className="text-aura fw-bold mb-0">
                            {activeProduct.price.toLocaleString('vi-VN')} ₫
                        </h3>
                        {activeProduct.originalPrice && (
                            <span className="text-decoration-line-through text-muted">
                                {activeProduct.originalPrice.toLocaleString('vi-VN')} ₫
                            </span>
                        )}
                    </div>

                    <div className="d-flex flex-wrap gap-2 mb-4">
                        <Badge
                            className="rounded-pill px-3 py-2"
                            style={{
                                background: stock > 0 ? 'var(--mint)' : 'var(--blush-strong)',
                                color: stock > 0 ? '#3d6b5c' : 'var(--rose-deep)',
                            }}
                        >
                            {stock > 0 ? `Còn ${stock} sản phẩm` : 'Hết hàng'}
                        </Badge>
                        <Badge className="rounded-pill px-3 py-2" style={{ background: 'var(--lavender)' }}>
                            Đã bán: {activeProduct.sold || 0}
                        </Badge>
                    </div>

                    {showShadePicker && (
                        <div className="mb-4">
                            <strong className="d-block mb-3">Chọn màu</strong>
                            <ShadePicker
                                items={pickerItems}
                                selectedId={selectedPickerId}
                                onSelect={handlePickerSelect}
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <strong className="d-block mb-2">Số lượng</strong>
                        <div className="d-inline-flex align-items-center aura-shade-qty">
                            <button
                                type="button"
                                className="aura-shade-qty-btn"
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                                aria-label="Giảm số lượng"
                            >
                                −
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
                    </div>

                    <div className="d-flex gap-2 flex-wrap">
                        <Button
                            className="btn-aura flex-grow-1 py-3"
                            onClick={handleAddToCart}
                            disabled={loading || stock <= 0}
                        >
                            <i className="bi bi-bag-plus me-2" />
                            {loading ? 'Đang thêm...' : 'Thêm vào giỏ'}
                        </Button>
                        <Button
                            className="btn-aura-outline flex-grow-1 py-3"
                            onClick={handleAddToCart}
                            disabled={stock <= 0}
                        >
                            Mua ngay
                        </Button>
                    </div>

                    <hr className="my-4" />
                    <h5 className="fw-bold">Mô tả</h5>
                    <p className="text-muted" style={{ lineHeight: 1.8 }}>
                        {activeProduct.description || 'Son môi cao cấp Aura Lips — màu chuẩn, bền màu, dưỡng môi.'}
                    </p>
                </Col>
            </Row>

            {similar.length > 0 && (
                <section className="mt-5 pt-4">
                    <h3 className="font-display mb-4">Sản phẩm tương tự</h3>
                    <Row className="g-4">
                        {similar.map((p) => (
                            <Col key={p._id} sm={6} lg={3}>
                                <ProductCard product={p} />
                            </Col>
                        ))}
                    </Row>
                </section>
            )}
        </Container>
    );
};

export default ProductDetail;
