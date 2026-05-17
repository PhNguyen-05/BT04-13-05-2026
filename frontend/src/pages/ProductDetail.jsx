import { useEffect, useState, useContext } from 'react';
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
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, similarRes] = await Promise.all([
                    api.get(`/products/${id}`),
                    api.get(`/products/${id}/similar`),
                ]);
                setProduct(productRes.data);
                setSimilar(similarRes.data);
                setQuantity(1);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [id]);

    const handleAddToCart = async () => {
        if (!user) {
            alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate('/login');
            return;
        }
        if (product.stock <= 0) {
            alert('Sản phẩm đã hết hàng!');
            return;
        }

        setLoading(true);
        const success = await addToCart(id, quantity);
        if (success) {
            alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
        }
        setLoading(false);
    };

    if (!product) {
        return (
            <Container className="py-5 text-center">
                <p>Đang tải thông tin sản phẩm...</p>
            </Container>
        );
    }

    const images = product.images?.length
        ? product.images
        : ['https://images.unsplash.com/photo-1586495778270-3263b471a0db?w=600'];

    return (
        <Container className="py-5">
            <Button as={Link} to="/shop" variant="link" className="link-aura mb-3 p-0">
                <i className="bi bi-arrow-left me-1" />
                Quay lại cửa hàng
            </Button>

            <Row className="g-5">
                <Col lg={6}>
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay, Thumbs]}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={images.length > 1 ? { delay: 5000 } : false}
                        thumbs={{ swiper: thumbsSwiper }}
                        className="rounded-4 overflow-hidden shadow-sm"
                    >
                        {images.map((img, index) => (
                            <SwiperSlide key={index}>
                                <img
                                    src={img}
                                    alt={product.name}
                                    className="w-100"
                                    style={{
                                        maxHeight: '480px',
                                        objectFit: 'contain',
                                        background: 'var(--blush)',
                                    }}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {images.length > 1 && (
                        <Swiper
                            onSwiper={setThumbsSwiper}
                            spaceBetween={10}
                            slidesPerView={4}
                            freeMode
                            watchSlidesProgress
                            className="mt-3"
                        >
                            {images.map((img, index) => (
                                <SwiperSlide key={index}>
                                    <img
                                        src={img}
                                        alt=""
                                        className="rounded-3 w-100 border"
                                        style={{ height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </Col>

                <Col lg={6}>
                    <Badge className="mb-2 rounded-pill" style={{ background: 'var(--lavender)' }}>
                        Danh mục: {product.category?.name || 'Chưa phân loại'}
                    </Badge>

                    <h1 className="font-display fw-bold mb-3">{product.name}</h1>

                    <div className="d-flex align-items-baseline gap-3 mb-3">
                        <h3 className="text-aura fw-bold mb-0">
                            {product.price.toLocaleString('vi-VN')} ₫
                        </h3>
                        {product.originalPrice && (
                            <span className="text-decoration-line-through text-muted">
                                {product.originalPrice.toLocaleString('vi-VN')} ₫
                            </span>
                        )}
                    </div>

                    <div className="d-flex flex-wrap gap-2 mb-4">
                        <Badge
                            className="rounded-pill px-3 py-2"
                            style={{
                                background: product.stock > 0 ? 'var(--mint)' : 'var(--blush-strong)',
                                color: product.stock > 0 ? '#3d6b5c' : 'var(--rose-deep)',
                            }}
                        >
                            {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                        </Badge>
                        <Badge className="rounded-pill px-3 py-2" style={{ background: 'var(--lavender)' }}>
                            Đã bán: {product.sold || 0}
                        </Badge>
                    </div>

                    <div className="mb-4">
                        <strong className="d-block mb-2">Số lượng</strong>
                        <div className="d-inline-flex align-items-center aura-qty-control">
                            <Button
                                variant="outline-secondary"
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                            >
                                −
                            </Button>
                            <span className="px-4 fs-5 fw-bold">{quantity}</span>
                            <Button
                                variant="outline-secondary"
                                onClick={() => setQuantity((q) => Math.min(q + 1, product.stock))}
                                disabled={quantity >= product.stock || product.stock <= 0}
                            >
                                +
                            </Button>
                        </div>
                    </div>

                    <div className="d-flex gap-2 flex-wrap">
                        <Button
                            className="btn-aura flex-grow-1 py-3"
                            onClick={handleAddToCart}
                            disabled={loading || product.stock <= 0}
                        >
                            <i className="bi bi-bag-plus me-2" />
                            {loading ? 'Đang thêm...' : 'Thêm vào giỏ'}
                        </Button>
                        <Button
                            className="btn-aura-outline flex-grow-1 py-3"
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                        >
                            Mua ngay
                        </Button>
                    </div>

                    <hr className="my-4" />
                    <h5 className="fw-bold">Mô tả</h5>
                    <p className="text-muted" style={{ lineHeight: 1.8 }}>
                        {product.description || 'Son môi cao cấp Aura Lips — màu chuẩn, bền màu, dưỡng môi.'}
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
