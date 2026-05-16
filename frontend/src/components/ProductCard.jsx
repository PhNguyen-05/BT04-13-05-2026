import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    return (
        <Card className="h-100 shadow-sm">
            <Card.Img variant="top" src={product.images?.[0] || 'https://via.placeholder.com/300'} style={{ height: '250px', objectFit: 'cover' }} />
            <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>
                    {product.price.toLocaleString('vi-VN')} ₫
                    {product.originalPrice && (
                        <span className="text-decoration-line-through ms-2 text-muted">
                            {product.originalPrice.toLocaleString('vi-VN')} ₫
                        </span>
                    )}
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                    <Badge bg="success">Còn {product.stock} sp</Badge>
                    <Link to={`/product/${product._id}`}>
                        <Button variant="primary" size="sm">Chi tiết</Button>
                    </Link>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;