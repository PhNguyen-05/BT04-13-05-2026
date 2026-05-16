import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import api from '../services/api.service';
import ProductCard from '../components/ProductCard';
import { AuthContext } from '../context/AuthContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [similar, setSimilar] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            const [productRes, similarRes] = await Promise.all([
                api.get(`/products/${id}`),
                api.get(`/products/${id}/similar`),
            ]);
            setProduct(productRes.data);
            setSimilar(similarRes.data);
            setQuantity(1);
        };
        fetchProduct();
    }, [id]);

    const increaseQty = () => {
        setQuantity((q) => Math.min(q + 1, product.stock));
    };

    const decreaseQty = () => {
        setQuantity((q) => Math.max(1, q - 1));
    };

    const handleAddToCart = async () => {
        if (!user) {
            alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate('/login');
            return;
        }
        if (product.stock <= 0) {
            alert('Sản phẩm đã hết hàng');
            return;
        }

        setLoading(true);
        try {
            await api.post('/cart/add', { productId: id, quantity });
            alert('Đã thêm vào giỏ hàng!');
        } catch (error) {
            alert(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
        } finally {
            setLoading(false);
        }
    };

    if (!product) return <Container className="mt-4"><p>Đang tải...</p></Container>;

    const images = product.images?.length
        ? product.images
        : ['https://via.placeholder.com/500?text=No+Image'];

    return (
        <Container className="mt-4">
            <Row>
                <Col md={6}>
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 4000 }}
                        className="mb-4"
                    >
                        {images.map((img, index) => (
                            <SwiperSlide key={index}>
                                <img
                                    src={img}
                                    alt={product.name}
                                    className="img-fluid rounded"
                                    style={{ maxHeight: '500px', width: '100%', objectFit: 'contain' }}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Col>

                <Col md={6}>
                    <h2>{product.name}</h2>
                    <h4 className="text-danger">{product.price.toLocaleString('vi-VN')} ₫</h4>

                    <p><strong>Danh mục:</strong> {product.category?.name || 'Chưa phân loại'}</p>
                    <p><Badge bg="info">Đã bán: {product.sold}</Badge></p>
                    <p>
                        <Badge bg={product.stock > 0 ? 'success' : 'danger'}>
                            {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                        </Badge>
                    </p>

                    <div className="my-3">
                        <strong>Số lượng:</strong>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={decreaseQty}
                            disabled={quantity <= 1}
                            className="mx-2"
                        >
                            -
                        </Button>
                        <span className="mx-3 fs-5">{quantity}</span>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={increaseQty}
                            disabled={quantity >= product.stock || product.stock <= 0}
                        >
                            +
                        </Button>
                    </div>

                    <Button
                        variant="primary"
                        size="lg"
                        className="me-3"
                        onClick={handleAddToCart}
                        disabled={loading || product.stock <= 0}
                    >
                        {loading ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                    </Button>
                    <Button
                        variant="success"
                        size="lg"
                        disabled={product.stock <= 0}
                        onClick={handleAddToCart}
                    >
                        Mua ngay
                    </Button>

                    <hr />
                    <h5>Mô tả</h5>
                    <p>{product.description}</p>
                </Col>
            </Row>

            {similar.length > 0 && (
                <>
                    <h4 className="mt-5">Sản phẩm tương tự</h4>
                    <Row>
                        {similar.map((p) => (
                            <Col md={3} key={p._id}>
                                <ProductCard product={p} />
                            </Col>
                        ))}
                    </Row>
                </>
            )}
        </Container>
    );
};

export default ProductDetail;
