import { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import api from '../services/api.service';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sort, setSort] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/categories')
            .then((res) => setCategories(res.data))
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, category, minPrice, maxPrice, sort]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (sort) params.append('sort', sort);

            const query = params.toString();
            const res = await api.get(`/products${query ? `?${query}` : ''}`);
            setProducts(res.data);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-4">
            <h2>Cửa hàng Aura Lips</h2>

            <Row className="mb-4 g-2">
                <Col md={3}>
                    <Form.Control
                        type="text"
                        placeholder="Tìm kiếm son môi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Col>
                <Col md={2}>
                    <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">Tất cả danh mục</option>
                        {categories.map((c) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Control
                        type="number"
                        placeholder="Giá tối thiểu"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                    />
                </Col>
                <Col md={2}>
                    <Form.Control
                        type="number"
                        placeholder="Giá tối đa"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                    />
                </Col>
                <Col md={3}>
                    <Form.Select value={sort} onChange={(e) => setSort(e.target.value)}>
                        <option value="">Sắp xếp</option>
                        <option value="newest">Mới nhất</option>
                        <option value="sold">Bán chạy</option>
                        <option value="price_asc">Giá tăng dần</option>
                        <option value="price_desc">Giá giảm dần</option>
                    </Form.Select>
                </Col>
            </Row>

            {loading ? (
                <p>Đang tải sản phẩm...</p>
            ) : products.length === 0 ? (
                <p className="text-muted">Không tìm thấy sản phẩm phù hợp.</p>
            ) : (
                <Row>
                    {products.map((product) => (
                        <Col key={product._id} md={3} className="mb-4">
                            <ProductCard product={product} />
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default Shop;
