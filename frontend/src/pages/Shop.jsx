import { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryStrip from '../components/CategoryStrip';
import api from '../services/api.service';

const Shop = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || '');
    const [onSale, setOnSale] = useState(searchParams.get('onSale') === 'true');
    const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
    const [featured, setFeatured] = useState(searchParams.get('featured') === 'true');
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const observer = useRef();

    useEffect(() => {
        api.get('/categories')
            .then((res) => setCategories(res.data))
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        const c = searchParams.get('category');
        if (c) setCategory(c);
        if (searchParams.get('onSale') === 'true') setOnSale(true);
    }, [searchParams]);

    useEffect(() => {
        setProducts([]);
        setPage(1);
        setTotal(0);
        setHasMore(false);
    }, [search, category, minPrice, maxPrice, sort, onSale, inStock, featured]);

    useEffect(() => {
        const timer = setTimeout(() => fetchProducts(page), 400);
        return () => clearTimeout(timer);
    }, [page, search, category, minPrice, maxPrice, sort, onSale, inStock, featured]);

    const fetchProducts = async (currentPage = 1) => {
        if (currentPage === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (sort) params.append('sort', sort);
            if (onSale) params.append('onSale', 'true');
            if (inStock) params.append('inStock', 'true');
            if (featured) params.append('featured', 'true');
            params.append('page', currentPage);
            params.append('limit', limit);

            const res = await api.get(`/products?${params.toString()}`);
            const responseData = res.data || {};
            const items = responseData.data || [];
            setProducts((prev) => (currentPage === 1 ? items : [...prev, ...items]));
            setTotal(responseData.total || 0);
            setHasMore(currentPage < (responseData.totalPages || 0));
        } catch {
            setProducts([]);
            setHasMore(false);
        } finally {
            if (currentPage === 1) {
                setLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    };

    const lastProductRef = useCallback(
        (node) => {
            if (loading || loadingMore) return;
            if (observer.current) observer.current.disconnect();
            if (!hasMore) return;

            observer.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) {
                        setPage((prevPage) => prevPage + 1);
                    }
                },
                { rootMargin: '150px' }
            );

            if (node) observer.current.observe(node);
        },
        [loading, loadingMore, hasMore]
    );

    const resetFilters = () => {
        setSearch('');
        setCategory('');
        setMinPrice('');
        setMaxPrice('');
        setSort('');
        setOnSale(false);
        setInStock(false);
        setFeatured(false);
    };

    return (
        <Container className="py-5">
            <header className="aura-section-header mb-4">
                <span className="aura-section-tag">Cửa hàng</span>
                <h1 className="aura-section-title font-display">Tìm son môi yêu thích</h1>
                <p className="aura-section-desc"> 3CE, Romand, Into You, Merzy, BBIA</p>
            </header>

            <h5 className="fw-bold mb-3 font-display">Danh mục thương hiệu</h5>
            <CategoryStrip categories={categories} />

            <div className="aura-filter-panel p-4 mb-4 rounded-4">
                <Row className="g-3 align-items-end">
                    <Col lg={3} md={6}>
                        <Form.Label className="aura-form-label small">Tìm kiếm</Form.Label>
                        <Form.Control
                            className="aura-form-control"
                            placeholder="Tên son, thương hiệu..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </Col>
                    <Col lg={2} md={6}>
                        <Form.Label className="aura-form-label small">Danh mục</Form.Label>
                        <Form.Select
                            className="aura-form-control"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col lg={2} md={4}>
                        <Form.Label className="aura-form-label small">Giá từ</Form.Label>
                        <Form.Control
                            type="number"
                            className="aura-form-control"
                            placeholder="0"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                    </Col>
                    <Col lg={2} md={4}>
                        <Form.Label className="aura-form-label small">Giá đến</Form.Label>
                        <Form.Control
                            type="number"
                            className="aura-form-control"
                            placeholder="500000"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </Col>
                    <Col lg={3} md={4}>
                        <Form.Label className="aura-form-label small">Sắp xếp</Form.Label>
                        <Form.Select
                            className="aura-form-control"
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                        >
                            <option value="">Mặc định</option>
                            <option value="newest">Mới nhất</option>
                            <option value="sold">Bán chạy</option>
                            <option value="views">Xem nhiều nhất</option>
                            <option value="price_asc">Giá tăng dần</option>
                            <option value="price_desc">Giá giảm dần</option>
                        </Form.Select>
                    </Col>
                </Row>

                <Row className="g-3 mt-2 align-items-center">
                    <Col md={8} className="d-flex flex-wrap gap-3">
                        <Form.Check
                            type="checkbox"
                            id="onSale"
                            label="Đang giảm giá"
                            checked={onSale}
                            onChange={(e) => setOnSale(e.target.checked)}
                        />
                        <Form.Check
                            type="checkbox"
                            id="inStock"
                            label="Còn hàng"
                            checked={inStock}
                            onChange={(e) => setInStock(e.target.checked)}
                        />
                        <Form.Check
                            type="checkbox"
                            id="featured"
                            label="Nổi bật"
                            checked={featured}
                            onChange={(e) => setFeatured(e.target.checked)}
                        />
                    </Col>
                    <Col md={4} className="text-md-end">
                        <Button variant="link" className="link-aura p-0" onClick={resetFilters}>
                            <i className="bi bi-x-circle me-1" />
                            Xóa bộ lọc
                        </Button>
                    </Col>
                </Row>
            </div>

            <p className="text-muted small mb-3">
                {loading ? 'Đang tải...' : `Tìm thấy ${products.length} sản phẩm`}
            </p>

            {loading ? (
                <p className="text-center py-5">Đang tải sản phẩm...</p>
            ) : products.length === 0 ? (
                <p className="text-center text-muted py-5">Không tìm thấy sản phẩm phù hợp.</p>
            ) : (
                <>
                    <Row className="g-4">
                        {products.map((product, index) => (
                            <Col key={product._id} xl={3} lg={4} sm={6}>
                                <div ref={index === products.length - 1 ? lastProductRef : null}>
                                    <ProductCard product={product} />
                                </div>
                            </Col>
                        ))}
                    </Row>
                    <div className="text-center py-4">
                        {loadingMore && <p>Đang tải thêm sản phẩm...</p>}
                        {!loadingMore && hasMore && <p className="text-muted">Kéo xuống để tải thêm sản phẩm...</p>}
                        {!loadingMore && !hasMore && products.length > 0 && (
                            <p className="text-muted">Đã tải hết sản phẩm.</p>
                        )}
                    </div>
                </>
            )}
        </Container>
    );
};

export default Shop;
