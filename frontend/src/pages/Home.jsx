import { useEffect, useState } from 'react';
import { Container, Row, Col, Carousel, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ArticleCard from '../components/ArticleCard';
import MemberWelcome from '../components/MemberWelcome';
import CategoryStrip from '../components/CategoryStrip';
import HorizontalProductPager from '../components/HorizontalProductPager';
import ProductLineSwiper from '../components/ProductLineSwiper';
import api from '../services/api.service';
import { useAuth } from '../hooks/useAuth';
import { resolveImageUrl } from '../utils/imageUrl';
import { formatCurrency } from '../utils/formatters';

const Home = () => {
    const { user } = useAuth();
    const [promotions, setPromotions] = useState([]);
    const [promoProducts, setPromoProducts] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [mostViewed, setMostViewed] = useState([]);
    const [newProducts, setNewProducts] = useState([]);
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productLines, setProductLines] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    promoRes,
                    categoryRes,
                    saleRes,
                    featuredRes,
                    bestRes,
                    viewedRes,
                    newRes,
                    articleRes,
                    lineRes,
                ] = await Promise.all([
                    api.get('/promotions'),
                    api.get('/categories'),
                    api.get('/products?onSale=true&limit=4'),
                    api.get('/products?featured=true&limit=4'),
                    api.get('/products/top-selling?limit=10'),
                    api.get('/products/top-viewed?limit=10'),
                    api.get('/products?sort=newest&limit=4'),
                    api.get('/articles?featured=true&limit=3'),
                    api.get('/products/lines?lineLimit=24&productLimit=12'),
                ]);

                setPromotions(promoRes.data || []);
                setCategories(categoryRes.data || []);
                setPromoProducts((saleRes.data?.data || []).slice(0, 4));
                setFeatured((featuredRes.data?.data || []).slice(0, 4));
                setBestSellers(bestRes.data?.data || []);
                setMostViewed(viewedRes.data?.data || []);
                setNewProducts((newRes.data?.data || []).slice(0, 4));
                setProductLines(lineRes.data || []);
                const articlesData = articleRes.data || [];
                setArticles(
                    articlesData.length
                        ? articlesData
                        : (await api.get('/articles?limit=3')).data || []
                );
            } catch (err) {
                console.error('Home fetch error:', err.message);
            }
        };
        fetchData();
    }, []);

    const renderProducts = (list, emptyText) =>
        list.length > 0 ? (
            <Row className="g-4">
                {list.map((product, i) => (
                    <Col key={product._id} sm={6} lg={3} className={`animate-fade-in-up delay-${Math.min(i + 1, 4)}`}>
                        <ProductCard product={product} />
                    </Col>
                ))}
            </Row>
        ) : (
            <p className="text-center text-muted py-4">{emptyText}</p>
        );

    const heroSlides = promotions.length > 0
        ? promotions.map((p) => ({
            image: resolveImageUrl(p.image, resolveImageUrl('/product/1.jpg')),
            badge: p.discountText || 'Khuyến mãi',
            title: p.title,
            subtitle: p.description,
            link: p.link || '/shop',
        }))
        : [
            {
                image: resolveImageUrl('/product/1.jpg'),
                badge: '✨ Sale',
                title: 'Ưu đãi son môi',
                subtitle: 'Giảm đến 50% — Số lượng có hạn',
                link: '/shop?onSale=true',
            },
        ];

    return (
        <>
            <Container className="pt-3">
                <MemberWelcome />
            </Container>

            {/* Hero — khuyến mãi từ API */}
            <section className="aura-hero">
                <Carousel fade interval={5000}>
                    {heroSlides.map((slide, idx) => (
                        <Carousel.Item key={idx}>
                            <img src={slide.image} alt={slide.title} className="aura-hero-img" />
                            <div className="aura-hero-overlay">
                                <div className="aura-hero-content animate-fade-in-up">
                                    <span className="aura-hero-badge">{slide.badge}</span>
                                    <h1 className="aura-hero-title font-display">{slide.title}</h1>
                                    <p className="aura-hero-subtitle">{slide.subtitle}</p>
                                    <Button as={Link} to={slide.link} className="btn-aura btn-lg px-5 py-3">
                                        <i className="bi bi-tag me-2" />
                                        Xem khuyến mãi
                                    </Button>
                                </div>
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </section>

            <Container>
                <Row className="aura-trust-bar g-3 animate-fade-in-up delay-2">
                    {[
                        { icon: 'bi-truck', label: `Freeship đơn ${formatCurrency(300000)}` },
                        { icon: 'bi-patch-check', label: 'Chính hãng 100%' },
                        { icon: 'bi-gift', label: 'Quà tặng đơn đầu' },
                        { icon: 'bi-arrow-repeat', label: 'Đổi trả 7 ngày' },
                    ].map((item) => (
                        <Col key={item.label} xs={6} md={3}>
                            <div className="aura-trust-item">
                                <i className={`bi ${item.icon}`} />
                                <span>{item.label}</span>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* 5 thương hiệu */}
            <section className="aura-section pt-0">
                <Container>
                    <header className="aura-section-header mb-3">
                        <span className="aura-section-tag">Thương hiệu</span>
                        <h2 className="aura-section-title font-display">Mua theo danh mục</h2>
                    </header>
                    <CategoryStrip categories={categories} />
                </Container>
            </section>

            {productLines.length > 0 && (
                <>
                    <section className="aura-section pb-0">
                        <Container>
                            <header className="aura-section-header">
                                <span className="aura-section-tag">Dòng son</span>
                                <h2 className="aura-section-title font-display">Màu son theo từng dòng</h2>
                                <p className="aura-section-desc">
                                    Mỗi dòng son là một mục riêng, kéo ngang để xem đầy đủ các màu trong cùng bộ sưu tập.
                                </p>
                            </header>
                        </Container>
                    </section>

                    {productLines.map((line) => (
                        <ProductLineSwiper key={line.lineSlug} line={line} />
                    ))}
                </>
            )}

            {/* Sản phẩm khuyến mãi */}
            <section className="aura-section" style={{ background: 'linear-gradient(180deg, var(--peach) 0%, var(--cream) 100%)' }}>
                <Container>
                    <header className="aura-section-header">
                        <span className="aura-section-tag">🎁 Khuyến mãi</span>
                        <h2 className="aura-section-title font-display">Đang giảm giá</h2>
                        <p className="aura-section-desc">Sản phẩm son đang sale — mua ngay kẻo lỡ</p>
                    </header>
                    {renderProducts(promoProducts, 'Chưa có sản phẩm khuyến mãi.')}
                    <div className="text-center mt-3">
                        <Button as={Link} to="/shop?onSale=true" className="btn-aura-outline">
                            Xem tất cả khuyến mãi
                        </Button>
                    </div>
                </Container>
            </section>

            {/* Nổi bật */}
            <section className="aura-section aura-section-blush">
                <Container>
                    <header className="aura-section-header">
                        <span className="aura-section-tag">Nổi bật</span>
                        <h2 className="aura-section-title font-display">Sản phẩm nổi bật</h2>
                    </header>
                    {renderProducts(featured, 'Chưa có sản phẩm nổi bật.')}
                </Container>
            </section>

            <HorizontalProductPager
                title="🔥 Bán chạy"
                subtitle="Top 10 sản phẩm bán chạy nhất"
                products={bestSellers}
                viewAllLink="/shop?sort=sold"
            />

            <HorizontalProductPager
                title="👁️ Xem nhiều"
                subtitle="Top 10 sản phẩm được xem nhiều nhất"
                products={mostViewed}
                viewAllLink="/shop?sort=views"
            />

            {/* Mới nhất */}
            <section className="aura-section aura-section-lavender">
                <Container>
                    <header className="aura-section-header">
                        <span className="aura-section-tag">✨ Mới nhất</span>
                        <h2 className="aura-section-title font-display">Mới ra mắt</h2>
                    </header>
                    {renderProducts(newProducts, 'Sản phẩm mới sắp có!')}
                </Container>
            </section>

            {/* Tin & bài viết */}
            <section className="aura-section pb-5">
                <Container>
                    <header className="aura-section-header">
                        <span className="aura-section-tag">📰 Tin tức</span>
                        <h2 className="aura-section-title font-display">Tin & bài viết</h2>
                    </header>
                    {articles.length > 0 ? (
                        <Row className="g-4">
                            {articles.map((a) => (
                                <Col key={a._id} md={4}>
                                    <ArticleCard article={a} />
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <p className="text-center text-muted">Chưa có bài viết.</p>
                    )}
                    <div className="text-center mt-4">
                        <Button as={Link} to="/news" className="btn-aura-outline">
                            Xem tất cả tin & bài viết
                        </Button>
                    </div>
                </Container>
            </section>

            {!user && (
                <section className="aura-section pb-5">
                    <Container>
                        <div className="aura-promo-banner">
                            <h3 className="font-display">Giảm 15% cho thành viên mới</h3>
                            <p>Đăng ký — nhận mã AURA15 cho đơn son đầu tiên</p>
                            <Button as={Link} to="/register" className="btn-aura-ghost btn-lg px-4">
                                Đăng ký miễn phí
                            </Button>
                        </div>
                    </Container>
                </section>
            )}
        </>
    );
};

export default Home;
