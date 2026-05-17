import { Link } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';

const CategoryStrip = ({ categories, limit = 5 }) => {
    if (!categories?.length) return null;

    const display = categories.slice(0, limit);

    const getCover = (cat) => {
        if (cat.image) return cat.image;
        const folder = (cat.slug || cat.name || '').toString().toLowerCase();
        return `/${folder}/cover.jpg`;
    };

    return (
        <Row className="g-3 mb-4">
            {display.map((cat) => (
                <Col key={cat._id} xs={6} md={4} lg>
                    <Link
                        to={`/shop?category=${cat._id}`}
                        className="aura-category-card text-decoration-none d-block"
                    >
                        <div
                            className="aura-category-card-img-wrap"
                            style={{
                                backgroundImage: `url(${getCover(cat)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                height: 140,
                                borderRadius: 12,
                                overflow: 'hidden',
                            }}
                            aria-label={cat.name}
                        />
                        <span className="aura-category-card-name">{cat.name}</span>
                    </Link>
                </Col>
            ))}
        </Row>
    );
};

export default CategoryStrip;
