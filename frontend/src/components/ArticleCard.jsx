import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../utils/imageUrl';

const ArticleCard = ({ article }) => {
    const image = resolveImageUrl(article.images?.[0], resolveImageUrl('/logo.png'));
    const typeLabel = article.type === 'news' ? 'Tin tức' : 'Bài viết';

    return (
        <Card className="h-100 product-card border-0 overflow-hidden">
            <Card.Img
                variant="top"
                src={image}
                alt={article.title}
                style={{ height: '200px', objectFit: 'cover' }}
            />
            <Card.Body className="d-flex flex-column">
                <Badge
                    className="aura-article-badge align-self-start mb-2 rounded-pill"
                >
                    {article.categoryLabel || typeLabel}
                </Badge>
                <Card.Title className="fw-bold" style={{ fontSize: '1rem' }}>
                    {article.title}
                </Card.Title>
                <Card.Text className="text-muted small flex-grow-1">
                    {article.excerpt || article.content?.slice(0, 80)}...
                </Card.Text>
                <Link to={`/article/${article._id}`} className="link-aura small fw-bold">
                    Đọc thêm <i className="bi bi-arrow-right" />
                </Link>
            </Card.Body>
        </Card>
    );
};

export default ArticleCard;
