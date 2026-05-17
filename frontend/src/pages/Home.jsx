import { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Carousel, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ArticleCard from '../components/ArticleCard';
import MemberWelcome from '../components/MemberWelcome';
import CategoryStrip from '../components/CategoryStrip';
import api from '../services/api.service';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { user } = useContext(AuthContext);
    const [promotions, setPromotions] = useState([]);
    const [promoProducts, setPromoProducts] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [newProducts, setNewProducts] = useState([]);
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});

    useEffect(() => {
        console.log('📝 Home.jsx mounted — fetching initial data...');
        const fetchData = async () => {
            try {
                const [
                    promoRes,
                    saleRes,
                    featuredRes,
                    bestRes,
                    newRes,
                    articleRes,
                    categoryRes,
                ] = await Promise.all([
                    api.get('/promotions'),
                    api.get('/categories'),
                    api.get('/products?onSale=true'),
                    api.get('/products?featured=true'),
                    api.get('/products?sort=sold'),
                    api.get('/products?sort=newest'),
                    api.get('/articles?featured=true&limit=3'),
                ]);

                console.log('✅ Fetched:', {
                    promotions: promoRes.data?.length,
                    categories: categoryRes.data?.length,
                    onSale: saleRes.data?.length,
                    featured: featuredRes.data?.length,
                    bestSellers: bestRes.data?.length,
                    newProducts: newRes.data?.length,
                    articles: articleRes.data?.length,
                });

                setPromotions(promoRes.data);
                setPromoProducts(saleRes.data.slice(0, 4));
                setFeatured(featuredRes.data.slice(0, 4));
                setBestSellers(bestRes.data.slice(0, 4));
                setNewProducts(newRes.data.slice(0, 4));
                setArticles(articleRes.data.length ? articleRes.data : (await api.get('/articles?limit=3')).data);
                setCategories(categoryRes.data);
            } catch (err) {
                console.error('❌ Fetch error:', err.message, err.response?.status);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        console.log('🔍 DEBUG: categories =', categories);
        if (!categories?.length) {
            console.log('⚠️ categories is empty');
            return;
        }
        const top = categories.slice(0, 5);
        console.log('📦 Fetching products for categories:', top.map(c => c.name));
        Promise.all(top.map((cat) => api.get(`/products?category=${cat._id}`)))
            .then((resArr) => {
                console.log('✅ Products fetched:', resArr.map(r => ({ count: r.data.length })));
                const map = {};
                resArr.forEach((r, i) => {
                    map[top[i]._id] = (r.data || []).slice(0, 4);
                });
                console.log('🗂️ productsByCategory map:', Object.keys(map).length, 'categories');
                setProductsByCategory(map);
            })
            .catch((err) => console.error('❌ Error fetching products:', err));
    }, [categories]);

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
            image: p.image || '/logo.png',
            badge: p.discountText || 'Khuyến mãi',
            title: p.title,
            subtitle: p.description,
            link: p.link || '/shop',
        }))
        : [
            {
                image: '/bbia/bìa.jpg',
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
                        { icon: 'bi-truck', label: 'Freeship đơn 300k' },
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

            <section className="aura-section">
                <Container>
                    <header className="aura-section-header mb-3">
                        <span className="aura-section-tag">Danh mục</span>
                        <h2 className="aura-section-title font-display">Sản phẩm theo danh mục</h2>
                    </header>

                    {categories.slice(0, 5).map((cat) => (
                        <div key={cat._id} className="mb-4">
                            <div className="d-flex align-items-center mb-3">
                                <div
                                    style={{
                                        width: 120,
                                        height: 80,
                                        backgroundImage: `url(${cat.image || `/${(cat.slug || cat.name || '').toString().toLowerCase()}/bìa.jpg`})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        borderRadius: 8,
                                        marginRight: 16,
                                    }}
                                />
                                <div>
                                    <h5 className="mb-1">{cat.name}</h5>
                                    <Button as={Link} to={`/shop?category=${cat._id}`} className="btn-aura-outline btn-sm">
                                        Xem tất cả
                                    </Button>
                                </div>
                            </div>

                            {renderProducts(productsByCategory[cat._id] || [], 'Chưa có sản phẩm cho danh mục này.')}
                        </div>
                    ))}
                </Container>
            </section>

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

            {/* Bán chạy */}
            <section className="aura-section">
                <Container>
                    <header className="aura-section-header">
                        <span className="aura-section-tag">🔥 Bán chạy</span>
                        <h2 className="aura-section-title font-display">Bán chạy nhất</h2>
                    </header>
                    {renderProducts(bestSellers, 'Đang cập nhật...')}
                </Container>
            </section>

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
