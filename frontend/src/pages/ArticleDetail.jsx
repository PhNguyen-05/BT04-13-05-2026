import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Button } from 'react-bootstrap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import api from '../services/api.service';
import ArticleCard from '../components/ArticleCard';
import { resolveImageList } from '../utils/imageUrl';

const ArticleDetail = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [related, setRelated] = useState([]);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/articles/${id}`);
                setArticle(res.data);

                const listRes = await api.get(`/articles?type=${res.data.type}&limit=4`);
                setRelated(listRes.data.filter((a) => a._id !== id).slice(0, 3));
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [id]);

    if (!article) {
        return (
            <Container className="py-5 text-center">
                <p>Đang tải bài viết...</p>
            </Container>
        );
    }

    const images = resolveImageList(article.images?.length ? article.images : ['/logo.png']);
    const typeLabel = article.type === 'news' ? 'Tin tức' : 'Bài viết';

    return (
        <Container className="py-5">
            <Button as={Link} to="/news" variant="link" className="link-aura mb-3 p-0">
                <i className="bi bi-arrow-left me-1" />
                Quay lại tin & bài viết
            </Button>

            <Row className="g-5">
                <Col lg={6}>
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay, Thumbs]}
                        navigation
                        pagination={{ clickable: true }}
                        thumbs={{ swiper: thumbsSwiper }}
                        className="rounded-4 overflow-hidden shadow-sm"
                    >
                        {images.map((img, index) => (
                            <SwiperSlide key={index}>
                                <img
                                    src={img}
                                    alt={article.title}
                                    className="w-100"
                                    style={{
                                        maxHeight: '420px',
                                        objectFit: 'cover',
                                        background: 'var(--blush)',
                                    }}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {images.length > 1 && (
                        <Swiper
                            onSwiper={setThumbsSwiper}
                            spaceBetween={10}
                            slidesPerView={4}
                            freeMode
                            watchSlidesProgress
                            className="mt-3"
                        >
                            {images.map((img, index) => (
                                <SwiperSlide key={index}>
                                    <img
                                        src={img}
                                        alt=""
                                        className="rounded-3 w-100"
                                        style={{ height: '72px', objectFit: 'cover', cursor: 'pointer' }}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </Col>

                <Col lg={6}>
                    <Badge className="mb-3 rounded-pill px-3 py-2" style={{ background: 'var(--lavender)' }}>
                        {article.categoryLabel || typeLabel}
                    </Badge>
                    <h1 className="font-display fw-bold mb-3">{article.title}</h1>
                    <p className="text-muted small mb-4">
                        <i className="bi bi-calendar3 me-1" />
                        {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                        <span className="mx-2">·</span>
                        <i className="bi bi-eye me-1" />
                        {article.views} lượt xem
                    </p>
                    {article.excerpt && (
                        <p className="lead text-muted">{article.excerpt}</p>
                    )}
                    <hr />
                    <div className="article-content" style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                        {article.content}
                    </div>
                </Col>
            </Row>

            {related.length > 0 && (
                <section className="mt-5 pt-4">
                    <h3 className="font-display mb-4">Bài viết liên quan</h3>
                    <Row className="g-4">
                        {related.map((a) => (
                            <Col key={a._id} md={4}>
                                <ArticleCard article={a} />
                            </Col>
                        ))}
                    </Row>
                </section>
            )}
        </Container>
    );
};

export default ArticleDetail;
