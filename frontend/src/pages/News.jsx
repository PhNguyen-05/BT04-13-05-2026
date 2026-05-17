import { useEffect, useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import ArticleCard from '../components/ArticleCard';
import api from '../services/api.service';

const News = () => {
    const [articles, setArticles] = useState([]);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(fetchArticles, 300);
        return () => clearTimeout(timer);
    }, [search, type]);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (type) params.append('type', type);
            const res = await api.get(`/articles?${params.toString()}`);
            setArticles(res.data);
        } catch {
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <header className="aura-section-header mb-4">
                <span className="aura-section-tag">Tin & bài viết</span>
                <h1 className="aura-section-title font-display">Tin tức & Bí quyết làm đẹp</h1>
                <p className="aura-section-desc">
                    Cập nhật xu hướng son môi, review và hướng dẫn chăm sóc môi
                </p>
            </header>

            <Row className="mb-4 g-3">
                <Col md={6}>
                    <Form.Control
                        className="aura-form-control"
                        placeholder="Tìm kiếm bài viết..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Col>
                <Col md={4}>
                    <Form.Select
                        className="aura-form-control"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="">Tất cả loại</option>
                        <option value="news">Tin tức</option>
                        <option value="article">Bài viết</option>
                    </Form.Select>
                </Col>
            </Row>

            {loading ? (
                <p className="text-center py-5">Đang tải...</p>
            ) : articles.length === 0 ? (
                <p className="text-center text-muted py-5">Không có bài viết phù hợp.</p>
            ) : (
                <Row className="g-4">
                    {articles.map((article) => (
                        <Col key={article._id} md={6} lg={4}>
                            <ArticleCard article={article} />
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default News;
