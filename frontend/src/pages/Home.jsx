import { useEffect, useState } from 'react';
import { Container, Row, Col, Carousel, Badge } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import api from '../services/api.service';

const Home = () => {
    const [featured, setFeatured] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [newProducts, setNewProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/products');
                const products = res.data;
                setFeatured(products.filter((p) => p.isFeatured));
                setBestSellers([...products].sort((a, b) => b.sold - a.sold).slice(0, 8));
                setNewProducts([...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8));
            } catch {
                setFeatured([]);
                setBestSellers([]);
                setNewProducts([]);
            }
        };
        fetchData();
    }, []);

    return (
        <>
            {/* Banner Khuyến mãi */}
            <Carousel className="mb-5">
                <Carousel.Item>
                    <img className="d-block w-100" src="https://via.placeholder.com/1200x400?text=Sale+50%25+Son+Matte" alt="Khuyến mãi" />
                    <Carousel.Caption>
                        <h3>ƯU ĐÃI ĐẶC BIỆT</h3>
                        <p>Giảm đến 50% cho dòng son môi cao cấp</p>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>

            <Container>
                {/* Sản phẩm nổi bật */}
                <h2 className="text-center mb-4">🌟 Sản Phẩm Nổi Bật</h2>
                <Row>
                    {featured.map(product => (
                        <Col key={product._id} md={3} className="mb-4">
                            <ProductCard product={product} />
                        </Col>
                    ))}
                </Row>

                {/* Bán chạy nhất */}
                <h2 className="text-center mb-4 mt-5">🔥 Bán Chạy Nhất</h2>
                <Row>
                    {bestSellers.map(product => (
                        <Col key={product._id} md={3} className="mb-4">
                            <ProductCard product={product} />
                        </Col>
                    ))}
                </Row>

                {/* Mới nhất */}
                <h2 className="text-center mb-4 mt-5">✨ Mới Ra Mắt</h2>
                <Row>
                    {newProducts.map(product => (
                        <Col key={product._id} md={3} className="mb-4">
                            <ProductCard product={product} />
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    );
};

export default Home;