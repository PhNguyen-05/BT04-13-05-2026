import { useState, useMemo, useContext } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getProductImageCandidates, FALLBACK_IMG } from '../utils/imageUrl';
import { formatCurrency } from '../utils/formatters';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';

const ProductCard = ({ product, showQuickActions = false }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useContext(CartContext);
    const candidates = useMemo(() => getProductImageCandidates(product), [product]);
    const imageKey = `${product._id}-${Array.isArray(product.images) ? product.images.join('|') : product.images || ''}`;
    const [imageState, setImageState] = useState({ key: imageKey, attempt: 0 });
    const [adding, setAdding] = useState(false);

    const attempt = imageState.key === imageKey ? imageState.attempt : 0;

    const imgSrc =
        attempt >= candidates.length ? FALLBACK_IMG : candidates[attempt];

    const handleImgError = () => {
        setImageState((current) => {
            const currentAttempt = current.key === imageKey ? current.attempt : 0;
            return {
                key: imageKey,
                attempt: currentAttempt < candidates.length ? currentAttempt + 1 : currentAttempt,
            };
        });
    };

    const handleCartAction = async (buyNow = false) => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (product.stock <= 0) return;

        setAdding(true);
        const success = await addToCart(product._id, 1, null);
        setAdding(false);

        if (success && buyNow) {
            const checkoutSelection = [{ productId: product._id, variantId: null }];
            sessionStorage.setItem('checkoutSelection', JSON.stringify(checkoutSelection));
            navigate('/checkout', { state: { selectedItems: checkoutSelection } });
        }
    };

    return (
        <Card className="h-100 product-card border-0 overflow-hidden">
            <div className="position-relative">
                <Link to={`/product/${product._id}`} className="d-block">
                    <img
                        src={imgSrc}
                        onError={handleImgError}
                        className="card-img-top product-image"
                        alt={product.name}
                        style={{ height: '260px', objectFit: 'cover', width: '100%' }}
                        loading="lazy"
                    />
                </Link>
                {product.originalPrice && (
                    <Badge
                        className="position-absolute top-0 start-0 m-3 rounded-pill px-3"
                        style={{ background: 'var(--gradient-btn)' }}
                    >
                        SALE
                    </Badge>
                )}
                {product.isFeatured && (
                    <Badge
                        bg="light"
                        text="dark"
                        className="position-absolute top-0 end-0 m-3 rounded-pill"
                    >
                        <i className="bi bi-star-fill text-aura me-1" />
                        Hot
                    </Badge>
                )}
            </div>

            <Card.Body className="d-flex flex-column p-3">
                <Card.Title
                    as={Link}
                    to={`/product/${product._id}`}
                    className="fw-bold mb-2 text-decoration-none d-block"
                    style={{ fontSize: '1rem', color: 'var(--text-heading)' }}
                >
                    {product.name}
                </Card.Title>

                <div className="mt-auto">
                    <div className="d-flex align-items-baseline gap-2 mb-3">
                        <span className="fw-bold text-aura" style={{ fontSize: '1.1rem' }}>
                            {formatCurrency(product.price)}
                        </span>
                        {product.originalPrice && (
                            <small className="text-decoration-line-through text-muted">
                                {formatCurrency(product.originalPrice)}
                            </small>
                        )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                        <Badge
                            className={`rounded-pill px-3 py-2 ${product.stock > 0 ? 'badge-stock-in' : 'badge-stock-out'}`}
                        >
                            {product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}
                        </Badge>
                        <Link to={`/product/${product._id}`}>
                            <Button className="btn-aura-outline btn-sm py-1 px-3">
                                <i className="bi bi-heart me-1" />
                                Xem
                            </Button>
                        </Link>
                    </div>

                    {showQuickActions && (
                        <div className="product-card-actions mt-3">
                            <Button
                                className="btn-aura btn-sm py-2"
                                disabled={adding || product.stock <= 0}
                                onClick={() => handleCartAction(false)}
                            >
                                <i className="bi bi-bag-plus me-1" />
                                {adding ? 'Đang thêm...' : 'Thêm giỏ'}
                            </Button>
                            <Button
                                className="btn-aura-outline btn-sm py-2"
                                disabled={adding || product.stock <= 0}
                                onClick={() => handleCartAction(true)}
                            >
                                Mua ngay
                            </Button>
                        </div>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;
