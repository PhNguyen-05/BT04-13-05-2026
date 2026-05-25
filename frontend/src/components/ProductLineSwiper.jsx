import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ProductCard from './ProductCard';

const ProductLineSwiper = ({ line }) => {
    const products = line?.products || [];
    if (!products.length) return null;

    return (
        <section className="aura-section aura-product-line-section">
            <Container>
                <div className="aura-product-line-header">
                    <div>
                        <span className="aura-section-tag">{line.category?.name || 'Dòng son'}</span>
                        <h2 className="aura-section-title font-display">{line.lineName}</h2>
                        <p className="aura-product-line-meta">
                            {products.length} màu son trong dòng này
                        </p>
                    </div>
                    <Button
                        as={Link}
                        to={`/shop?lineSlug=${line.lineSlug}`}
                        className="btn-aura-outline btn-sm"
                    >
                        Xem tất cả màu
                    </Button>
                </div>

                <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{ clickable: true }}
                    watchOverflow
                    spaceBetween={20}
                    slidesPerView={1.1}
                    breakpoints={{
                        576: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        992: { slidesPerView: 4 },
                        1200: { slidesPerView: 5 },
                    }}
                    className="aura-product-line-swiper"
                >
                    {products.map((product) => (
                        <SwiperSlide key={product._id}>
                            <ProductCard product={product} showQuickActions />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Container>
        </section>
    );
};

export default ProductLineSwiper;
