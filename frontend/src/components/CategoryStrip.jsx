import { Link } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { resolveImageUrl } from '../utils/imageUrl';

const CategoryStrip = ({ categories, limit = 5 }) => {
    if (!categories?.length) return null;

    const display = categories.slice(0, limit);

    const getCover = (cat) => {
        if (cat.image) return resolveImageUrl(cat.image);
        const folder = (cat.slug || cat.name || '').toString().toLowerCase();
        return resolveImageUrl(`/${folder}/bia.jpg`);
    };

    const getSlug = (cat) => (cat.slug || cat.name || '').toString().toLowerCase().replace(/\s+/g, '');

    return (
        <Row className="g-3 mb-4">
            {display.map((cat) => (
                <Col key={cat._id} xs={6} md={4} lg>
                    <Link
                        to={`/shop?category=${cat._id}`}
                        className="aura-category-card text-decoration-none d-block"
                    >
                        <div className="aura-category-card-img-wrap">
                            <img
                                src={getCover(cat)}
                                alt={cat.name}
                                className={`aura-category-card-img aura-category-card-img--${getSlug(cat)}`}
                                loading="lazy"
                            />
                        </div>
                        <span className="aura-category-card-name">{cat.name}</span>
                    </Link>
                </Col>
            ))}
        </Row>
    );
};

export default CategoryStrip;
