import { useState, useEffect } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import ProductCard from './ProductCard';

const HorizontalProductPager = ({ title, subtitle, products, viewAllLink }) => {
    const [page, setPage] = useState(0);
    const pageSize = 5;
    const pages = Math.max(1, Math.ceil(products.length / pageSize));

    useEffect(() => {
        if (page >= pages) {
            setPage(0);
        }
    }, [page, pages]);

    const visibleItems = products.slice(page * pageSize, page * pageSize + pageSize);

    return (
        <section className="aura-section">
            <div className="d-flex flex-wrap align-items-start justify-content-between mb-4 gap-3">
                <div>
                    <span className="aura-section-tag">{title}</span>
                    <h2 className="aura-section-title font-display">{subtitle}</h2>
                </div>
                {viewAllLink && (
                    <Button href={viewAllLink} className="btn-aura-outline btn-sm">
                        Xem tất cả
                    </Button>
                )}
            </div>

            {visibleItems.length > 0 ? (
                <Row className="g-4">
                    {visibleItems.map((product) => (
                        <Col key={product._id} sm={6} lg={3}>
                            <ProductCard product={product} />
                        </Col>
                    ))}
                </Row>
            ) : (
                <p className="text-center text-muted py-4">Chưa có sản phẩm.</p>
            )}

            {pages > 1 && (
                <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
                    <Button
                        className="btn-aura-outline"
                        disabled={page === 0}
                        onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                    >
                        <i className="bi bi-chevron-left" />
                    </Button>
                    <span className="text-muted">
                        Trang {page + 1} / {pages}
                    </span>
                    <Button
                        className="btn-aura-outline"
                        disabled={page === pages - 1}
                        onClick={() => setPage((prev) => Math.min(pages - 1, prev + 1))}
                    >
                        <i className="bi bi-chevron-right" />
                    </Button>
                </div>
            )}
        </section>
    );
};

export default HorizontalProductPager;
