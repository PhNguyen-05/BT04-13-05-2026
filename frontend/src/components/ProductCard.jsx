import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    return (
        <Card className="h-100 product-card border-0 overflow-hidden">
            <div className="position-relative">
                <Card.Img
                    variant="top"
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1586495778270-3263b471a0db?w=400&q=80'}
                    className="product-image"
                    alt={product.name}
                    style={{ height: '260px', objectFit: 'cover' }}
                />
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
                <Card.Title className="fw-bold mb-2" style={{ fontSize: '1rem', color: 'var(--text-heading)' }}>
                    {product.name}
                </Card.Title>

                <div className="mt-auto">
                    <div className="d-flex align-items-baseline gap-2 mb-3">
                        <span className="fw-bold text-aura" style={{ fontSize: '1.1rem' }}>
                            {product.price.toLocaleString('vi-VN')} ₫
                        </span>
                        {product.originalPrice && (
                            <small className="text-decoration-line-through text-muted">
                                {product.originalPrice.toLocaleString('vi-VN')} ₫
                            </small>
                        )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                        <Badge
                            className="rounded-pill px-3 py-2"
                            style={{
                                background: product.stock > 0 ? 'var(--mint)' : 'var(--blush-strong)',
                                color: product.stock > 0 ? '#3d6b5c' : 'var(--rose-deep)',
                            }}
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
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;
